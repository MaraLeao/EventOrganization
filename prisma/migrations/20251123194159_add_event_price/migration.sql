-- DropIndex
DROP INDEX "public"."Ticket_userId_eventId_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");
