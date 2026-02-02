-- AlterTable
ALTER TABLE "Cart" ADD COLUMN "lockExpiresAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "departTimeISO" TEXT NOT NULL,
    "arriveTimeISO" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNo" TEXT NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "taxesAndFees" INTEGER NOT NULL,
    "seatsAvailable" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Flight" ("airline", "arriveTimeISO", "baseFare", "departTimeISO", "durationMins", "flightNo", "from", "id", "taxesAndFees", "to") SELECT "airline", "arriveTimeISO", "baseFare", "departTimeISO", "durationMins", "flightNo", "from", "id", "taxesAndFees", "to" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
