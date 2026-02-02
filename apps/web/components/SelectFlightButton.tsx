"use client";

import { useRouter } from "next/navigation";
import { createCart, addItem } from "../lib/api";
import { useAppStore } from "../lib/store";

export function SelectFlightButton({ flightId }: { flightId: string }) {
  const router = useRouter();
  const setCart = useAppStore((s) => s.setCart);

  return (
    <button
      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
      onClick={async () => {
        const cart = await createCart();
        await addItem(cart.id, flightId);
        setCart(cart.id, flightId);
        router.push("/travellers");
      }}
    >
      Select
    </button>
  );
}
