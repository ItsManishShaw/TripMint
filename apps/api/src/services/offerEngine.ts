import type { z } from "zod";
import { Offer, Cart } from "@travel/shared/schemas";

type OfferT = z.infer<typeof Offer>;
type CartT = z.infer<typeof Cart>;

export function eligibleOffers(cart: CartT, offers: OfferT[]): OfferT[] {
  const now = Date.now();
  const subtotalGuess =
    (cart.item?.baseFare ?? 0) +
    (cart.item?.taxesAndFees ?? 0) +
    (cart.convenienceFee || 24900);

  return offers
    .filter((o) => Date.parse(o.validTillISO) > now)
    .filter((o) => !o.minTxn || subtotalGuess >= o.minTxn)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function bestOffer(cart: CartT, offers: OfferT[]): OfferT | undefined {
  return eligibleOffers(cart, offers)[0];
}
