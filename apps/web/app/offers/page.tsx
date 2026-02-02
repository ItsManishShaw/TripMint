"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listOffers, applyOffer } from "../../lib/api";
import { useAppStore } from "../../lib/store";
import { INR } from "../../lib/money";

type Offer = {
  id: string;
  title: string;
  provider: string;
  channel: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "COUPON";
  discountType: "FLAT" | "PERCENT";
  flatOff?: number;
  percentOff?: number;
  maxCap?: number;
  minTxn?: number;
  validTillISO: string;
  priority: number;
};

export default function OffersPage() {
  const router = useRouter();
  const cartId = useAppStore((s) => s.cartId);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [best, setBest] = useState<Offer | undefined>();
  const [selected, setSelected] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cartId) return;
    (async () => {
      setLoading(true);
      const data = await listOffers(cartId);
      setOffers(data.eligibleOffers as any);
      setBest(data.bestOffer as any);
      setSelected(data.bestOffer?.id);
      setLoading(false);
    })();
  }, [cartId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return offers;
    return offers.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        o.provider.toLowerCase().includes(s) ||
        o.channel.toLowerCase().includes(s),
    );
  }, [offers, q]);

  if (!cartId) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Offers</h1>
        <p className="text-sm text-neutral-600">No active cart. Go back and select a flight.</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-neutral-500">Step 2 of 3</div>
        <h1 className="text-xl font-bold">Offers & Discounts</h1>
        <p className="text-sm text-neutral-600">Choose one offer to apply</p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bank / card / UPI / coupon"
        className="w-full rounded-xl border border-neutral-200 px-4 py-3"
      />

      {loading ? (
        <div className="text-sm text-neutral-600">Loading offers...</div>
      ) : (
        <>
          {best ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="text-xs font-semibold text-green-900">BEST OFFER</div>
              <div className="mt-1 font-semibold">{best.title}</div>
              <div className="text-sm text-neutral-700">
                {best.discountType === "FLAT"
                  ? `Save ${INR.format(best.flatOff ?? 0)}`
                  : `Save ${best.percentOff ?? 0}% (up to ${INR.format(best.maxCap ?? 0)})`}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {filtered.map((o) => (
              <button
                key={o.id}
                className={`w-full rounded-2xl border p-4 text-left ${
                  selected === o.id ? "border-neutral-900" : "border-neutral-200"
                }`}
                onClick={() => setSelected(o.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm text-neutral-600">
                      {o.provider} • {o.channel}
                    </div>
                    <div className="mt-1 text-sm">
                      {o.discountType === "FLAT"
                        ? `Save ${INR.format(o.flatOff ?? 0)}`
                        : `Save ${o.percentOff ?? 0}% (up to ${INR.format(o.maxCap ?? 0)})`}
                    </div>
                  </div>
                  <div className="mt-1 text-sm">{selected === o.id ? "✅" : "◻️"}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className="fixed bottom-4 left-0 right-0 mx-auto max-w-[420px] px-4"
        onClick={async () => {
          await applyOffer(cartId, selected);
          router.push("/fare");
        }}
      >
        <div className="rounded-xl bg-neutral-900 py-3 text-center font-semibold text-white">
          Apply offer
        </div>
      </button>
    </main>
  );
}
