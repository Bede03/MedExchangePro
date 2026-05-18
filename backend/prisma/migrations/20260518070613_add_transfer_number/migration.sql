/*
  Warnings:

  - A unique constraint covering the columns `[transfer_number]` on the table `transfers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "transfer_number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transfers_transfer_number_key" ON "transfers"("transfer_number");
