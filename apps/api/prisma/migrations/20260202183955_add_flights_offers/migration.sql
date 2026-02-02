-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "departTimeISO" TEXT NOT NULL,
    "arriveTimeISO" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNo" TEXT NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "taxesAndFees" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "flatOff" INTEGER,
    "percentOff" REAL,
    "maxCap" INTEGER,
    "minTxn" INTEGER,
    "validTillISO" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("cartId", "flightId", "id") SELECT "cartId", "flightId", "id" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE UNIQUE INDEX "CartItem_cartId_key" ON "CartItem"("cartId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
