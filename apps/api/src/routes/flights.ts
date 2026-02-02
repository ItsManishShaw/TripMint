import type { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function searchFlights(req: Request, res: Response) {
  const { from, to } = req.query;
  const flights = await prisma.flight.findMany({
    where: {
      from: from ? String(from).toUpperCase() : undefined,
      to: to ? String(to).toUpperCase() : undefined,
    },
  });
  res.json({ flights });
}
