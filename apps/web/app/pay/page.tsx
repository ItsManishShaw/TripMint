"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment, createBooking, createPayment, getPrice } from "../../lib/api";
import { useAppStore } from "../../lib/store";
import { INR } from "../../lib/money";

export default function PayPage() {
  const router = useRouter();
  const cartId = useAppStore((s) => s.cartId);
  const authToken = useAppStore((s) => s.authToken);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) return;
    (async () => {
      const p = await getPrice(cartId);
      setTotal(p.totalPayable);
    })();
  }, [cartId]);

  if (!cartId) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Payment</h1>
        <p className="text-sm text-neutral-600">No active cart. Go back and select a flight.</p>
      </main>
    );
  }

  if (!authToken) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Payment</h1>
        <p className="text-sm text-neutral-600">Please sign in to continue to payment.</p>
        <button
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => router.push("/login?next=/pay")}
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">Choose payment method</h1>
        <p className="text-sm text-neutral-600">No extra charges will be added at payment.</p>
      </header>

      <div className="space-y-2">
        {[
          { t: "UPI (Recommended)", d: "Fastest, instant confirmation" },
          { t: "Debit / Credit Card", d: "Visa, Mastercard, RuPay" },
          { t: "Net Banking", d: "All major banks" },
        ].map((m) => (
          <div key={m.t} className="rounded-2xl border border-neutral-200 p-4">
            <div className="font-semibold">{m.t}</div>
            <div className="text-sm text-neutral-600">{m.d}</div>
          </div>
        ))}
      </div>

      <button
        className="fixed bottom-4 left-0 right-0 mx-auto max-w-[420px] px-4"
        disabled={loading || total == null}
        onClick={async () => {
          if (!authToken) return;
          setErr(null);
          setLoading(true);
          try {
            const payment = await createPayment(cartId, authToken);
            await confirmPayment(payment.id, authToken);
            const booking = await createBooking(cartId, authToken);
            router.push(`/confirmed?bookingId=${encodeURIComponent(booking.id)}`);
          } catch (ex: any) {
            setErr(ex?.message ?? "Payment failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="rounded-xl bg-neutral-900 py-3 text-center font-semibold text-white">
          {loading ? "Processing..." : `Pay ${total == null ? "" : INR.format(total)}`}
        </div>
      </button>
      {err ? <div className="text-sm text-red-600">{err}</div> : null}
    </main>
  );
}
