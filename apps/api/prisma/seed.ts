import { PrismaClient } from "@prisma/client";
import { mockFlights, mockOffers } from "@travel/shared/mock";

const prisma = new PrismaClient();

async function main() {
  for (const flight of mockFlights) {
    await prisma.flight.upsert({
      where: { id: flight.id },
      update: {
        from: flight.from,
        to: flight.to,
        departTimeISO: flight.departTimeISO,
        arriveTimeISO: flight.arriveTimeISO,
        airline: flight.airline,
        flightNo: flight.flightNo,
        durationMins: flight.durationMins,
        baseFare: flight.baseFare,
        taxesAndFees: flight.taxesAndFees,
        seatsAvailable: 6,
      },
      create: {
        id: flight.id,
        from: flight.from,
        to: flight.to,
        departTimeISO: flight.departTimeISO,
        arriveTimeISO: flight.arriveTimeISO,
        airline: flight.airline,
        flightNo: flight.flightNo,
        durationMins: flight.durationMins,
        baseFare: flight.baseFare,
        taxesAndFees: flight.taxesAndFees,
        seatsAvailable: 6,
      },
    });
  }

  for (const offer of mockOffers) {
    await prisma.offer.upsert({
      where: { id: offer.id },
      update: {
        title: offer.title,
        provider: offer.provider,
        channel: offer.channel,
        discountType: offer.discountType,
        flatOff: offer.flatOff ?? null,
        percentOff: offer.percentOff ?? null,
        maxCap: offer.maxCap ?? null,
        minTxn: offer.minTxn ?? null,
        validTillISO: offer.validTillISO,
        priority: offer.priority ?? 0,
      },
      create: {
        id: offer.id,
        title: offer.title,
        provider: offer.provider,
        channel: offer.channel,
        discountType: offer.discountType,
        flatOff: offer.flatOff ?? null,
        percentOff: offer.percentOff ?? null,
        maxCap: offer.maxCap ?? null,
        minTxn: offer.minTxn ?? null,
        validTillISO: offer.validTillISO,
        priority: offer.priority ?? 0,
      },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
