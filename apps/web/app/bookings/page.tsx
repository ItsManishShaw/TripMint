"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listBookings } from "../../lib/api";
import { INR } from "../../lib/money";
import { useAppStore } from "../../lib/store";

export default function BookingsPage() {
  const router = useRouter();
  const authToken = useAppStore((s) => s.authToken);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    (async () => {
      setLoading(true);
      const data = await listBookings(authToken);
      setBookings(data);
      setLoading(false);
    })();
  }, [authToken]);

  if (!authToken) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">My bookings</h1>
        <p className="text-sm text-neutral-600">Please sign in to view your bookings.</p>
        <button
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => router.push("/login?next=/bookings")}
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">My bookings</h1>
        <p className="text-sm text-neutral-600">Your confirmed bookings tied to this account.</p>
      </header>

      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-neutral-600">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-neutral-600">No bookings yet.</div>
        ) : (
          bookings.map((b: any) => (
            <div key={b.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="font-semibold">{b.id}</div>
              <div className="text-sm text-neutral-600">Status: {b.status}</div>
              <div className="mt-2 text-sm">
                Paid: <span className="font-semibold">{INR.format(b.totalPaid)}</span>
              </div>
              <div className="mt-1 text-xs text-neutral-500">{b.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
