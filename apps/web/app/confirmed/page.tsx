import Link from "next/link";

export default function ConfirmedPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  const bookingId = searchParams.bookingId ?? "—";
  return (
    <main className="space-y-4">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="text-lg font-bold">Booking Confirmed 🎉</div>
        <div className="mt-1 text-sm text-neutral-700">Your ticket has been booked successfully.</div>
        <div className="mt-3 text-sm text-neutral-600">Booking ID</div>
        <div className="font-mono font-semibold">{bookingId}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/bookings" className="rounded-xl bg-neutral-900 py-3 text-center font-semibold text-white">
          My bookings
        </Link>
        <Link href="/" className="rounded-xl border border-neutral-200 py-3 text-center font-semibold">
          Book another
        </Link>
      </div>

      <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
        Need help? ☎ 24×7 booking support
      </div>
    </main>
  );
}
