import type { z } from "zod";
import { Cart, Offer, PriceBreakdown } from "@travel/shared/schemas";

type CartT = z.infer<typeof Cart>;
type OfferT = z.infer<typeof Offer>;
type PriceT = z.infer<typeof PriceBreakdown>;

// All money is integer paise (no floats).
export function computePrice(cart: CartT, offers: OfferT[]): PriceT {
  const item = cart.item;
  if (!item) {
    return {
      baseFare: 0,
      taxesAndFees: 0,
      convenienceFee: 0,
      discount: 0,
      subtotal: 0,
      totalPayable: 0
    };
  }

  const baseFare = item.baseFare;
  const taxesAndFees = item.taxesAndFees;

  // MVP fee policy: flat ₹249 (paise) – later can be % + caps by channel/provider.
  const convenienceFee = cart.convenienceFee || 24900;

  const subtotal = baseFare + taxesAndFees + convenienceFee;

  let discount = 0;
  let savingsLabel: string | undefined;

  if (cart.appliedOfferId) {
    const offer = offers.find((o) => o.id === cart.appliedOfferId);
    if (offer) {
      const minTxnOk = !offer.minTxn || subtotal >= offer.minTxn;
      if (minTxnOk) {
        if (offer.discountType === "FLAT") {
          discount = offer.flatOff ?? 0;
        } else {
          const pct = offer.percentOff ?? 0;
          discount = Math.round((subtotal * pct) / 100);
        }
        if (offer.maxCap) discount = Math.min(discount, offer.maxCap);
        savingsLabel = `Saved ₹${(discount / 100).toLocaleString("en-IN")}`;
      }
    }
  }

  const totalPayable = Math.max(0, subtotal - discount);

  return {
    baseFare,
    taxesAndFees,
    convenienceFee,
    discount,
    subtotal,
    totalPayable,
    savingsLabel
  };
}
