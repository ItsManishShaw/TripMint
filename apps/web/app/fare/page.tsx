"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPrice, lockCart } from "../../lib/api";
import { useAppStore } from "../../lib/store";
import { INR } from "../../lib/money";

type Price = {
  baseFare: number;
  taxesAndFees: number;
  convenienceFee: number;
  discount: number;
  subtotal: number;
  totalPayable: number;
  savingsLabel?: string;
};

export default function FarePage() {
  const router = useRouter();
  const cartId = useAppStore((s) => s.cartId);
  const [price, setPrice] = useState<Price | null>(null);

  useEffect(() => {
    if (!cartId) return;
    (async () => setPrice((await getPrice(cartId)) as any))();
  }, [cartId]);

  if (!cartId) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Fare Summary</h1>
        <p className="text-sm text-neutral-600">No active cart. Go back and select a flight.</p>
      </main>
    );
  }

  if (!price) return <div className="text-sm text-neutral-600">Loading fare...</div>;

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-neutral-500">Step 3 of 3</div>
        <h1 className="text-xl font-bold">Fare Summary</h1>
      </header>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Base Fare</span>
          <span className="font-semibold">{INR.format(price.baseFare)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Taxes & Airline Fees</span>
          <span className="font-semibold">{INR.format(price.taxesAndFees)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Platform Convenience Fee</span>
          <span className="font-semibold">{INR.format(price.convenienceFee)}</span>
        </div>
        <div className="my-2 h-px bg-neutral-200" />
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-semibold">{INR.format(price.subtotal)}</span>
        </div>
      </div>

      {price.discount > 0 ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="font-semibold text-green-900">
            🎉 {price.savingsLabel ?? "Offer applied"}
          </div>
          <div className="mt-1 text-sm text-neutral-700">
            Discount: {INR.format(price.discount)}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-neutral-50 p-4">
        <div className="text-xs text-neutral-600">You Pay</div>
        <div className="text-2xl font-bold">{INR.format(price.totalPayable)}</div>
        <div className="mt-2 text-xs text-neutral-500">
          Cancellation and rescheduling charges are subject to airline policy. Platform convenience
          fee is non-refundable.
        </div>
      </div>

      <button
        className="fixed bottom-4 left-0 right-0 mx-auto max-w-[420px] px-4"
        onClick={async () => {
          await lockCart(cartId);
          router.push("/pay");
        }}
      >
        <div className="rounded-xl bg-green-900 py-3 text-center font-semibold text-white">
          Proceed to payment
        </div>
      </button>
    </main>
  );
}
