import { INR } from "./money";
import type { z } from "zod";
import { FlightItinerary, Offer } from "./schemas";

export const mockFlights: z.infer<typeof FlightItinerary>[] = [
  {
    id: "FL-INDIGO-0610",
    from: "GOI",
    to: "CCU",
    departTimeISO: "2026-01-03T06:10:00+05:30",
    arriveTimeISO: "2026-01-03T09:15:00+05:30",
    airline: "IndiGo",
    flightNo: "6E-XXXX",
    durationMins: 185,
    baseFare: INR.toPaise(18570),
    taxesAndFees: INR.toPaise(4432)
  },
  {
    id: "FL-AIRINDIA-0810",
    from: "GOI",
    to: "CCU",
    departTimeISO: "2026-01-03T08:10:00+05:30",
    arriveTimeISO: "2026-01-03T11:25:00+05:30",
    airline: "Air India",
    flightNo: "AI-YYY",
    durationMins: 195,
    baseFare: INR.toPaise(17650),
    taxesAndFees: INR.toPaise(5120)
  }
];

export const mockOffers: z.infer<typeof Offer>[] = [
  {
    id: "OFF-HDFC-UPI-1200",
    title: "HDFC UPI Offer",
    provider: "HDFC",
    channel: "UPI",
    discountType: "FLAT",
    flatOff: INR.toPaise(1200),
    minTxn: INR.toPaise(10000),
    validTillISO: "2026-01-31T23:59:59+05:30",
    priority: 100
  },
  {
    id: "OFF-ICICI-CARD-800",
    title: "ICICI Credit Card Offer",
    provider: "ICICI",
    channel: "CARD",
    discountType: "FLAT",
    flatOff: INR.toPaise(800),
    minTxn: INR.toPaise(10000),
    validTillISO: "2026-01-31T23:59:59+05:30",
    priority: 80
  },
  {
    id: "OFF-COUPON-5PCT",
    title: "WELCOME5",
    provider: "Coupon",
    channel: "COUPON",
    discountType: "PERCENT",
    percentOff: 5,
    maxCap: INR.toPaise(600),
    minTxn: INR.toPaise(8000),
    validTillISO: "2026-02-15T23:59:59+05:30",
    priority: 60
  }
];
