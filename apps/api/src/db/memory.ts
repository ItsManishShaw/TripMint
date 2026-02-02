import type { z } from "zod";
import { Cart } from "@travel/shared/schemas";

type CartT = z.infer<typeof Cart>;

const carts = new Map<string, CartT>();
const bookings = new Map<string, any>();

export const MemoryDB = {
  carts,
  bookings
};
