import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { computePrice } from "../services/pricing";
import { toCart } from "../services/cartMapper";
import { getAuthUser } from "../middleware/auth";

const CreatePaymentBody = z.object({ cartId: z.string() });
const ConfirmPaymentBody = z.object({ paymentId: z.string() });

export async function createPayment(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const { cartId } = CreatePaymentBody.parse(req.body);

  const record = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { item: { include: { flight: true } }, travellers: true },
  });
  if (!record) return res.status(404).json({ error: "Cart not found" });
  if (record.userId && record.userId !== authUser.id) {
    return res.status(403).json({ error: "Cart does not belong to user" });
  }
  if (record.status !== "LOCKED") return res.status(400).json({ error: "Cart must be LOCKED" });
  if (!record.lockExpiresAt || new Date(record.lockExpiresAt).getTime() <= Date.now()) {
    if (record.item?.flightId) {
      await prisma.$transaction([
        prisma.flight.update({
          where: { id: record.item.flightId },
          data: { seatsAvailable: { increment: 1 } },
        }),
        prisma.cart.update({
          where: { id: record.id },
          data: { status: "DRAFT", lockExpiresAt: null },
        }),
      ]);
    } else {
      await prisma.cart.update({
        where: { id: record.id },
        data: { status: "DRAFT", lockExpiresAt: null },
      });
    }
    return res.status(400).json({ error: "Lock expired" });
  }

  const cart = toCart(record);
  const offers = await prisma.offer.findMany();
  const price = computePrice(cart, offers);

  const payment = await prisma.payment.create({
    data: {
      id: `PAY-${crypto.randomUUID()}`,
      cartId,
      userId: authUser.id,
      amount: price.totalPayable,
      currency: "INR",
      status: "CREATED",
      provider: "MOCK",
    },
  });

  res.json({ payment });
}

export async function confirmPayment(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const { paymentId } = ConfirmPaymentBody.parse(req.body);

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  if (payment.userId !== authUser.id) return res.status(403).json({ error: "Forbidden" });

  if (payment.status !== "CAPTURED") {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "CAPTURED", providerRef: `MOCK-${crypto.randomUUID()}` },
    });
  }

  const updated = await prisma.payment.findUnique({ where: { id: paymentId } });
  res.json({ payment: updated });
}
