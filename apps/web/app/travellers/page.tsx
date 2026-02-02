"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addTravellers } from "../../lib/api";
import { useAppStore } from "../../lib/store";

export default function TravellersPage() {
  const router = useRouter();
  const cartId = useAppStore((s) => s.cartId);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!cartId) {
    return (
      <main className="space-y-3">
        <h1 className="text-xl font-bold">Traveller details</h1>
        <p className="text-sm text-neutral-600">No active cart. Go back and select a flight.</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-neutral-500">Step 1 of 3</div>
        <h1 className="text-xl font-bold">Traveller details</h1>
      </header>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          const fd = new FormData(e.currentTarget);
          const travellers = [
            {
              firstName: String(fd.get("firstName") ?? ""),
              lastName: String(fd.get("lastName") ?? ""),
              gender: String(fd.get("gender") ?? "MALE"),
            },
          ];
          try {
            await addTravellers(cartId, travellers);
            router.push("/offers");
          } catch (ex: any) {
            setErr(ex?.message ?? "Something went wrong");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="rounded-2xl border border-neutral-200 p-4 space-y-3">
          <div className="font-semibold">Passenger 1</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-xs text-neutral-600">First name</div>
              <input
                name="firstName"
                required
                className="w-full rounded-xl border border-neutral-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-neutral-600">Last name</div>
              <input
                name="lastName"
                required
                className="w-full rounded-xl border border-neutral-200 px-3 py-2"
              />
            </label>
          </div>
          <label className="space-y-1">
            <div className="text-xs text-neutral-600">Gender</div>
            <select name="gender" className="w-full rounded-xl border border-neutral-200 px-3 py-2">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
          🔒 Secure checkout • 🧾 GST invoice available • ☎ 24×7 booking support
        </div>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}

        <button
          disabled={loading}
          className="fixed bottom-4 left-0 right-0 mx-auto max-w-[420px] px-4"
          type="submit"
        >
          <div className="rounded-xl bg-green-900 py-3 text-center font-semibold text-white">
            {loading ? "Saving..." : "Continue to offers"}
          </div>
        </button>
      </form>
    </main>
  );
}
