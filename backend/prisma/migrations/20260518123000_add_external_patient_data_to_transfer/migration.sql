/*
  Add external patient snapshot for transfers
*/

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN "external_patient_data" JSONB NULL;
