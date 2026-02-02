import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { Traveller as TravellerSchema } from "@travel/shared/schemas";
import { prisma } from "../db/prisma";
import { computePrice } from "../services/pricing";
import { bestOffer, eligibleOffers } from "../services/offerEngine";
import { toCart } from "../services/cartMapper";

const CreateCartBody = z.object({});
const AddItemBody = z.object({ flightId: z.string() });
const AddTravellersBody = z.object({ travellers: z.array(TravellerSchema) });
const ApplyOfferBody = z.object({ offerId: z.string().optional() });
const LOCK_TTL_MS = 15 * 60 * 1000;

async function loadCart(id?: string) {
  if (!id) return null;
  return prisma.cart.findUnique({
    where: { id },
    include: { item: { include: { flight: true } }, travellers: true },
  });
}

async function loadOffers() {
  return prisma.offer.findMany();
}

export async function createCart(req: Request, res: Response) {
  CreateCartBody.parse(req.body ?? {});
  const id = `CART-${crypto.randomUUID()}`;
  await prisma.cart.create({
    data: {
      id,
      status: "DRAFT",
      convenienceFee: 24900,
    },
  });
  const record = await loadCart(id);
  if (!record) return res.status(500).json({ error: "Failed to create cart" });
  res.json({ cart: toCart(record) });
}

export async function getCart(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });
  res.json({ cart: toCart(record) });
}

export async function addItem(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });
  const { flightId } = AddItemBody.parse(req.body);

  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) return res.status(400).json({ error: "Invalid flightId" });

  await prisma.cartItem.upsert({
    where: { cartId: record.id },
    update: { flightId },
    create: { cartId: record.id, flightId },
  });

  const nextRecord = await loadCart(record.id);
  if (!nextRecord) return res.status(404).json({ error: "Cart not found" });
  const next = toCart(nextRecord);
  const offers = await loadOffers();
  res.json({ cart: next, price: computePrice(next, offers) });
}

export async function addTravellers(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });

  const { travellers } = AddTravellersBody.parse(req.body);

  await prisma.$transaction([
    prisma.traveller.deleteMany({ where: { cartId: record.id } }),
    prisma.traveller.createMany({
      data: travellers.map((t) => ({
        cartId: record.id,
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender,
      })),
    }),
  ]);

  const nextRecord = await loadCart(record.id);
  if (!nextRecord) return res.status(404).json({ error: "Cart not found" });
  res.json({ cart: toCart(nextRecord) });
}

export async function listOffers(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });

  const cart = toCart(record);
  const offers = await loadOffers();
  const eligible = eligibleOffers(cart, offers);
  const best = bestOffer(cart, offers);
  res.json({ bestOffer: best, eligibleOffers: eligible });
}

export async function applyOffer(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });

  const { offerId } = ApplyOfferBody.parse(req.body);
  if (offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) return res.status(400).json({ error: "Invalid offerId" });
  }
  await prisma.cart.update({
    where: { id: record.id },
    data: { appliedOfferId: offerId ?? null },
  });

  const nextRecord = await loadCart(record.id);
  if (!nextRecord) return res.status(404).json({ error: "Cart not found" });
  const next = toCart(nextRecord);
  const offers = await loadOffers();
  res.json({ cart: next, price: computePrice(next, offers) });
}

export async function lockCart(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });
  if (!record.item?.flight) return res.status(400).json({ error: "Cart has no flight" });

  const now = new Date();
  const expiresAt = record.lockExpiresAt ? new Date(record.lockExpiresAt) : undefined;

  if (record.status === "LOCKED" && expiresAt && expiresAt.getTime() > now.getTime()) {
    const next = toCart(record);
    const offers = await loadOffers();
    return res.json({ cart: next, price: computePrice(next, offers) });
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (record.status === "LOCKED" && expiresAt && expiresAt.getTime() <= now.getTime()) {
        await tx.flight.update({
          where: { id: record.item!.flightId },
          data: { seatsAvailable: { increment: 1 } },
        });
        await tx.cart.update({
          where: { id: record.id },
          data: { status: "DRAFT", lockExpiresAt: null },
        });
      }

      const flight = await tx.flight.findUnique({ where: { id: record.item!.flightId } });
      if (!flight || flight.seatsAvailable <= 0) throw new Error("NO_SEATS");

      await tx.flight.update({
        where: { id: record.item!.flightId },
        data: { seatsAvailable: { decrement: 1 } },
      });

      await tx.cart.update({
        where: { id: record.id },
        data: {
          status: "LOCKED",
          lockExpiresAt: new Date(Date.now() + LOCK_TTL_MS),
        },
      });
    });
  } catch (err: any) {
    if (err?.message === "NO_SEATS") {
      return res.status(409).json({ error: "No seats available" });
    }
    throw err;
  }

  const nextRecord = await loadCart(record.id);
  if (!nextRecord) return res.status(404).json({ error: "Cart not found" });
  const next = toCart(nextRecord);
  const offers = await loadOffers();
  return res.json({ cart: next, price: computePrice(next, offers) });
}

export async function getPrice(req: Request, res: Response) {
  const record = await loadCart(req.params.id);
  if (!record) return res.status(404).json({ error: "Cart not found" });
  const cart = toCart(record);
  const offers = await loadOffers();
  res.json({ price: computePrice(cart, offers) });
}
