import { z } from "zod";

export const CityCode = z.string().min(3).max(3); // GOI, CCU, DEL

export const FlightItinerary = z.object({
  id: z.string(),
  from: CityCode,
  to: CityCode,
  departTimeISO: z.string(),
  arriveTimeISO: z.string(),
  airline: z.string(),
  flightNo: z.string(),
  durationMins: z.number().int().positive(),
  // Money in paise
  baseFare: z.number().int().nonnegative(),
  taxesAndFees: z.number().int().nonnegative()
});

export const Traveller = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dobISO: z.string().optional()
});

export const Offer = z.object({
  id: z.string(),
  title: z.string(),
  provider: z.string(),
  channel: z.enum(["UPI", "CARD", "NETBANKING", "WALLET", "COUPON"]),
  discountType: z.enum(["FLAT", "PERCENT"]),
  flatOff: z.number().int().nonnegative().optional(),   // paise
  percentOff: z.number().nonnegative().optional(),      // 0-100
  maxCap: z.number().int().nonnegative().optional(),    // paise
  minTxn: z.number().int().nonnegative().optional(),    // paise
  validTillISO: z.string(),
  priority: z.number().int().default(0)
});

export const Cart = z.object({
  id: z.string(),
  status: z.enum(["DRAFT", "LOCKED", "BOOKED"]),
  item: FlightItinerary.optional(),
  travellers: z.array(Traveller).default([]),
  convenienceFee: z.number().int().nonnegative().default(0), // paise
  appliedOfferId: z.string().optional()
});

export const PriceBreakdown = z.object({
  baseFare: z.number().int().nonnegative(),
  taxesAndFees: z.number().int().nonnegative(),
  convenienceFee: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  subtotal: z.number().int().nonnegative(),
  totalPayable: z.number().int().nonnegative(),
  savingsLabel: z.string().optional()
});
