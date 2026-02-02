import { searchFlights } from "../../lib/api";
import { INR } from "../../lib/money";
import { SelectFlightButton } from "../../components/SelectFlightButton";

export default async function ResultsPage({
  searchParams
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = (searchParams.from ?? "GOI").toUpperCase();
  const to = (searchParams.to ?? "CCU").toUpperCase();

  const flights = await searchFlights({ from, to });

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm text-neutral-500">{from} → {to}</div>
        <h1 className="text-xl font-bold">Choose a flight</h1>
      </header>

      <div className="space-y-3">
        {flights.map((f) => {
          const total = f.baseFare + f.taxesAndFees;
          return (
            <div key={f.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{f.airline} {f.flightNo}</div>
                  <div className="text-sm text-neutral-600">
                    {f.departTimeISO.slice(11, 16)} → {f.arriveTimeISO.slice(11, 16)} • {Math.round(f.durationMins / 60)}h {f.durationMins % 60}m
                  </div>
                  <div className="mt-2 text-lg font-bold">{INR.format(total)}</div>
                  <div className="text-xs text-neutral-500">incl. taxes & fees</div>
                </div>
                <SelectFlightButton flightId={f.id} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
