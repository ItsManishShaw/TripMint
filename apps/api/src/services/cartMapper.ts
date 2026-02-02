import type { Prisma } from "@prisma/client";
import { Cart } from "@travel/shared/schemas";

export type CartRecord = Prisma.CartGetPayload<{
  include: { item: { include: { flight: true } }; travellers: true };
}>;

export function toCart(record: CartRecord) {
  const item = record.item?.flight
    ? {
        id: record.item.flight.id,
        from: record.item.flight.from,
        to: record.item.flight.to,
        departTimeISO: record.item.flight.departTimeISO,
        arriveTimeISO: record.item.flight.arriveTimeISO,
        airline: record.item.flight.airline,
        flightNo: record.item.flight.flightNo,
        durationMins: record.item.flight.durationMins,
        baseFare: record.item.flight.baseFare,
        taxesAndFees: record.item.flight.taxesAndFees,
      }
    : undefined;

  return Cart.parse({
    id: record.id,
    status: record.status,
    item,
    travellers: record.travellers.map((t) => ({
      firstName: t.firstName,
      lastName: t.lastName,
      gender: t.gender,
    })),
    convenienceFee: record.convenienceFee,
    appliedOfferId: record.appliedOfferId ?? undefined,
  });
}
