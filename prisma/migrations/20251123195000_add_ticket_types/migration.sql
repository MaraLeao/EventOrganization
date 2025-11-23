-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketTypeId" TEXT;

-- Seed default ticket types based on existing events
INSERT INTO "TicketType" ("id", "eventId", "name", "price", "quantity")
SELECT gen_random_uuid()::text, "id", 'Ingresso Padrão', "price", "maxCapacity"
FROM "Event";

-- Link existing tickets to their default ticket type
UPDATE "Ticket" t
SET "ticketTypeId" = tt."id",
    "price" = COALESCE(t."price", tt."price")
FROM "TicketType" tt
WHERE tt."eventId" = t."eventId" AND tt."name" = 'Ingresso Padrão';

-- Ensure column is not nullable after backfill
ALTER TABLE "Ticket" ALTER COLUMN "ticketTypeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Ticket_ticketTypeId_idx" ON "Ticket"("ticketTypeId");

-- DropColumn
ALTER TABLE "Event" DROP COLUMN "price";
