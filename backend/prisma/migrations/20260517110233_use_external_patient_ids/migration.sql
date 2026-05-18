-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'clinician', 'registrar', 'hospital_staff');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "referral_status" AS ENUM ('pending', 'approved', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "referral_priority" AS ENUM ('Emergency', 'Urgent', 'Routine');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('User_Updated', 'Status_Changed', 'User_Created', 'Data_Accessed', 'Referral_Created', 'Referral_Approved', 'Referral_Rejected', 'Patient_Created', 'Patient_Updated', 'Login', 'Logout');

-- CreateEnum
CREATE TYPE "audit_entity_type" AS ENUM ('User', 'Referral', 'Patient', 'Hospital');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_departments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "gender" NOT NULL,
    "dob" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referral_number" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "referral_status" NOT NULL DEFAULT 'pending',
    "priority" "referral_priority" NOT NULL,
    "department" TEXT NOT NULL,
    "requesting_hospital_id" TEXT NOT NULL,
    "receiving_hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "audit_action" NOT NULL,
    "entity_type" "audit_entity_type" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'success',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_patient_records" (
    "id" TEXT NOT NULL,
    "referral_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "receiving_hospital_id" TEXT NOT NULL,
    "test_results" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "medical_history" TEXT,
    "vitals_last_recorded" TEXT,
    "current_diagnosis" TEXT,
    "clinical_notes" TEXT,
    "patient_documents" TEXT,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessed_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_patient_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "patient_national_id" TEXT NOT NULL,
    "patient_name" TEXT,
    "from_hospital_id" TEXT NOT NULL,
    "to_hospital_id" TEXT NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason_for_transfer" TEXT,
    "significant_findings" TEXT,
    "clinical_presentation" TEXT,
    "immediate_condition" TEXT,
    "temperature" TEXT,
    "spo2" TEXT,
    "rr" TEXT,
    "pulse" TEXT,
    "bp" TEXT,
    "weight" TEXT,
    "muac" TEXT,
    "laboratory" TEXT,
    "diagnosis" TEXT,
    "procedures" TEXT,
    "medications" TEXT,
    "transport_type" TEXT,
    "transport_notes" TEXT,
    "insurance_type" TEXT,
    "insurance_other" TEXT,
    "referring_clinician" TEXT,
    "referring_phone" TEXT,
    "receiving_service" TEXT,
    "receiving_phone" TEXT,
    "admission_date" TEXT,
    "admission_time" TEXT,
    "decision_date" TEXT,
    "decision_time" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_departments_hospital_id_department_name_key" ON "hospital_departments"("hospital_id", "department_name");

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_key" ON "patients"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referral_number_key" ON "referrals"("referral_number");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "shared_patient_records_referral_id_idx" ON "shared_patient_records"("referral_id");

-- CreateIndex
CREATE INDEX "shared_patient_records_patient_id_idx" ON "shared_patient_records"("patient_id");

-- CreateIndex
CREATE INDEX "shared_patient_records_receiving_hospital_id_idx" ON "shared_patient_records"("receiving_hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_transfer_id_key" ON "transfers"("transfer_id");

-- CreateIndex
CREATE INDEX "transfers_patient_national_id_idx" ON "transfers"("patient_national_id");

-- CreateIndex
CREATE INDEX "transfers_from_hospital_id_idx" ON "transfers"("from_hospital_id");

-- CreateIndex
CREATE INDEX "transfers_to_hospital_id_idx" ON "transfers"("to_hospital_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_departments" ADD CONSTRAINT "hospital_departments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_requesting_hospital_id_fkey" FOREIGN KEY ("requesting_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_receiving_hospital_id_fkey" FOREIGN KEY ("receiving_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_patient_records" ADD CONSTRAINT "shared_patient_records_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_patient_records" ADD CONSTRAINT "shared_patient_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_patient_records" ADD CONSTRAINT "shared_patient_records_receiving_hospital_id_fkey" FOREIGN KEY ("receiving_hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_hospital_id_fkey" FOREIGN KEY ("from_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_hospital_id_fkey" FOREIGN KEY ("to_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
