import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { computePrice } from "../services/pricing";
import { toCart } from "../services/cartMapper";
import { getAuthUser } from "../middleware/auth";

export async function createBooking(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const { cartId } = req.body as { cartId?: string };
  if (!cartId) return res.status(400).json({ error: "cartId required" });

  const record = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { item: { include: { flight: true } }, travellers: true },
  });
  if (!record) return res.status(404).json({ error: "Cart not found" });

  if (record.userId && record.userId !== authUser.id) {
    return res.status(403).json({ error: "Cart does not belong to user" });
  }

  const cart = toCart(record);
  if (cart.status !== "LOCKED") return res.status(400).json({ error: "Cart must be LOCKED" });
  if (!record.lockExpiresAt || new Date(record.lockExpiresAt).getTime() <= Date.now()) {
    return res.status(400).json({ error: "Lock expired" });
  }

  const paid = await prisma.payment.findFirst({
    where: { cartId, userId: authUser.id, status: "CAPTURED" },
    orderBy: { createdAt: "desc" },
  });
  if (!paid) return res.status(400).json({ error: "Payment required" });

  const offers = await prisma.offer.findMany();
  const price = computePrice(cart, offers);
  const bookingId = `BK-${crypto.randomUUID()}`;

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        id: bookingId,
        cartId,
        userId: authUser.id,
        status: "CONFIRMED",
        totalPaid: price.totalPayable,
      },
    });

    await tx.cart.update({
      where: { id: cartId },
      data: { status: "BOOKED", userId: record.userId ?? authUser.id },
    });

    return created;
  });

  res.json({ booking });
}

export async function listBookings(_req: Request, res: Response) {
  const authUser = getAuthUser(_req);
  const bookings = await prisma.booking.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ bookings });
}

export async function getBooking(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Not found" });
  if (booking.userId !== authUser.id) return res.status(403).json({ error: "Forbidden" });
  res.json({ booking });
}
