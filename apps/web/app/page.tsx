import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">Compare & Book Travel Deals</h1>
        <p className="text-sm text-neutral-600">Flights first. Trains & buses coming soon.</p>
      </header>

      <section className="rounded-2xl border border-neutral-200 p-4 space-y-3">
        <div className="flex gap-2">
          <button className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            Flights
          </button>
          <button className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500" disabled>
            Trains
          </button>
          <button className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500" disabled>
            Buses
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-xs text-neutral-500">From</div>
            <div className="font-semibold">GOI</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-xs text-neutral-500">To</div>
            <div className="font-semibold">CCU</div>
          </div>
          <div className="col-span-2 rounded-xl border border-neutral-200 p-3">
            <div className="text-xs text-neutral-500">Date</div>
            <div className="font-semibold">03 Jan</div>
          </div>
        </div>

        <Link
          href="/results?from=GOI&to=CCU"
          className="block rounded-xl bg-green-900 py-3 text-center font-semibold text-white"
        >
          Search Flights
        </Link>
      </section>

      <section className="rounded-2xl bg-neutral-50 p-4">
        <div className="text-sm font-semibold">Why book with us</div>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600">
          <li>🔒 Secure checkout</li>
          <li>🧾 GST invoice available</li>
          <li>☎ 24×7 booking support</li>
        </ul>
      </section>
    </main>
  );
}
