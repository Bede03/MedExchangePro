-- ============================================================================
-- MedExchange PostgreSQL Database Setup
-- This script creates all tables and inserts mock data based on the project
-- ============================================================================

-- ============================================================================
-- CREATE ALL TABLES
-- ============================================================================

-- Drop tables if they exist (in correct order to respect foreign keys)
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "referrals" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "hospitals" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;

-- ============================================================================
-- 1. HOSPITALS TABLE
-- ============================================================================
-- Base table - hospitals don't depend on anything
CREATE TABLE "hospitals" (
  "id" TEXT PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "location" VARCHAR(500) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_hospitals_name" ON "hospitals"("name");

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
-- Depends on: hospitals
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "full_name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(500) NOT NULL,
  "role" TEXT NOT NULL CHECK ("role" IN ('admin', 'clinician', 'registrar', 'hospital_staff')),
  "hospital_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_users_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_hospital_id" ON "users"("hospital_id");

-- ============================================================================
-- 3. PATIENTS TABLE
-- ============================================================================
-- Depends on: hospitals
CREATE TABLE "patients" (
  "id" TEXT PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "gender" TEXT NOT NULL CHECK ("gender" IN ('male', 'female', 'other')),
  "dob" DATE NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "address" VARCHAR(500) NOT NULL,
  "national_id" VARCHAR(50) NOT NULL UNIQUE,
  "hospital_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_patients_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_patients_hospital_id" ON "patients"("hospital_id");
CREATE INDEX "idx_patients_national_id" ON "patients"("national_id");
CREATE INDEX "idx_patients_name" ON "patients"("name");

-- ============================================================================
-- 4. REFERRALS TABLE
-- ============================================================================
-- Depends on: patients, hospitals
CREATE TABLE "referrals" (
  "id" TEXT PRIMARY KEY,
  "patient_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'completed', 'rejected')),
  "priority" TEXT NOT NULL CHECK ("priority" IN ('Emergency', 'Urgent', 'Routine')),
  "department" VARCHAR(255),
  "requesting_hospital_id" TEXT NOT NULL,
  "receiving_hospital_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP,
  CONSTRAINT "fk_referrals_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_referrals_requesting_hospital" FOREIGN KEY ("requesting_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_referrals_receiving_hospital" FOREIGN KEY ("receiving_hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_referrals_patient_id" ON "referrals"("patient_id");
CREATE INDEX "idx_referrals_requesting_hospital_id" ON "referrals"("requesting_hospital_id");
CREATE INDEX "idx_referrals_receiving_hospital_id" ON "referrals"("receiving_hospital_id");
CREATE INDEX "idx_referrals_status" ON "referrals"("status");
CREATE INDEX "idx_referrals_created_at" ON "referrals"("created_at");

-- ============================================================================
-- 5. AUDIT LOGS TABLE
-- ============================================================================
-- Depends on: users
CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL CHECK ("action" IN (
    'User_Updated', 'Status_Changed', 'User_Created', 'Data_Accessed',
    'Referral_Created', 'Referral_Approved', 'Referral_Rejected',
    'Patient_Created', 'Patient_Updated', 'Login', 'Logout'
  )),
  "entity_type" TEXT NOT NULL CHECK ("entity_type" IN ('User', 'Referral', 'Patient', 'Hospital')),
  "entity_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "details" JSONB,
  "status" VARCHAR(50) DEFAULT 'success',
  "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_entity_id" ON "audit_logs"("entity_id");
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");

-- ============================================================================
-- 6. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE "notifications" (
  "id" TEXT PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('info', 'success', 'warning', 'error')),
  "read" BOOLEAN DEFAULT FALSE,
  "user_id" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");

-- ============================================================================
-- INSERT DATA - HOSPITALS (2 records)
-- ============================================================================
INSERT INTO "hospitals" ("id", "name", "location", "created_at", "updated_at") VALUES
('hosp-01', 'CHUK', 'KN 05 St, Kigali', NOW(), NOW()),
('hosp-02', 'King Faisal Hospital', 'KK 03 St, Kigali', NOW(), NOW());

-- ============================================================================
-- INSERT DATA - USERS (3 records)
-- Note: Passwords are hashed with bcryptjs - these are for password123
-- In production, ALWAYS hash passwords properly!
-- ============================================================================
INSERT INTO "users" ("id", "full_name", "email", "password", "role", "hospital_id", "created_at", "updated_at") VALUES
('user-01', 'Jean Claude', 'jean@kfh.rw', '$2a$10$Lx5q8yFvR1V8.Z5pK9x7eezx7h8g3q9z5vn6m2c8b7j9h3x1k4y6u', 'admin', 'hosp-02', NOW(), NOW()),
('user-02', 'Izere Mpuhwe', 'izere@chuk.rw', '$2a$10$Lx5q8yFvR1V8.Z5pK9x7eezx7h8g3q9z5vn6m2c8b7j9h3x1k4y6u', 'clinician', 'hosp-01', NOW(), NOW()),
('user-03', 'Aline Uwase', 'aline@chuk.rw', '$2a$10$Lx5q8yFvR1V8.Z5pK9x7eezx7h8g3q9z5vn6m2c8b7j9h3x1k4y6u', 'hospital_staff', 'hosp-01', NOW(), NOW());

-- ============================================================================
-- INSERT DATA - PATIENTS (6 records)
-- Distributed across 2 hospitals
-- ============================================================================
INSERT INTO "patients" ("id", "name", "gender", "dob", "phone", "address", "national_id", "hospital_id", "created_at", "updated_at") VALUES
('pat-01', 'Emmanuel Niyonzima', 'male', '1989-06-15', '0781234567', 'KN 5 Rd, Kacyiru, Kigali', '1200987654321001', 'hosp-01', '2026-02-23 09:00:00', NOW()),
('pat-02', 'Aline Uwase', 'female', '1997-04-08', '0782345678', 'KN 5 Rd, Kacyiru, Kigali', '1200123456789002', 'hosp-01', '2026-02-18 10:00:00', NOW()),
('pat-03', 'Jean Pierre', 'male', '1972-11-21', '0783456789', 'KN 3 Rd, Kigali', '1200456789012003', 'hosp-02', '2026-01-15 11:30:00', NOW()),
('pat-04', 'Chantal Habimana', 'female', '1980-03-14', '0784567890', 'KN 3 Rd, Kigali', '1200789012345004', 'hosp-02', '2026-02-20 14:15:00', NOW()),
('pat-05', 'Eric Ndizeye', 'male', '1959-12-02', '0785678901', 'KN 5 Rd, Kacyiru, Kigali', '1200234567890005', 'hosp-01', '2026-02-01 08:45:00', NOW()),
('pat-06', 'Sandrine Mukasine', 'female', '1995-07-30', '0786789012', 'KN 3 Rd, Kigali', '1200345678901006', 'hosp-02', '2026-02-10 13:00:00', NOW());

-- ============================================================================
-- INSERT DATA - REFERRALS (8 records)
-- Status flow: pending -> approved -> completed OR rejected
-- Priority: Emergency, Urgent, Routine
-- ============================================================================
INSERT INTO "referrals" ("id", "patient_id", "reason", "status", "priority", "department", "requesting_hospital_id", "receiving_hospital_id", "created_at", "updated_at", "completed_at") VALUES
-- Completed referrals
('ref-1008', 'pat-05', 'Heart attack', 'completed', 'Emergency', 'Cardiology', 'hosp-01', 'hosp-02', '2026-03-20 10:30:00', '2026-03-28 15:45:00', '2026-03-28 15:45:00'),
('ref-1007', 'pat-02', 'Post-surgical complication', 'completed', 'Urgent', 'Surgery', 'hosp-01', 'hosp-02', '2026-03-18 14:00:00', '2026-03-27 11:20:00', '2026-03-27 11:20:00'),
('ref-1003', 'pat-02', 'ICU monitoring', 'completed', 'Emergency', 'ICU', 'hosp-01', 'hosp-02', '2026-03-22 09:15:00', '2026-03-26 16:30:00', '2026-03-26 16:30:00'),

-- Rejected referral
('ref-1006', 'pat-02', 'Pediatric emergency', 'rejected', 'Emergency', 'Pediatrics', 'hosp-01', 'hosp-02', '2026-03-16 13:45:00', '2026-03-24 10:00:00', NULL),

-- Approved referrals (not yet completed)
('ref-1005', 'pat-01', 'Orthopedic fracture', 'approved', 'Urgent', 'Orthopedics', 'hosp-01', 'hosp-02', '2026-03-24 08:30:00', NOW(), NULL),
('ref-1002', 'pat-03', 'Cardiology consultation', 'approved', 'Routine', 'Cardiology', 'hosp-02', 'hosp-01', '2026-03-27 10:00:00', NOW(), NULL),

-- Pending referrals (awaiting action)
('ref-1004', 'pat-05', 'Chest imaging required', 'pending', 'Routine', 'Radiology', 'hosp-01', 'hosp-02', '2026-03-26 11:15:00', NOW(), NULL),
('ref-1001', 'pat-04', 'Surgery evaluation', 'pending', 'Urgent', 'Surgery', 'hosp-02', 'hosp-01', '2026-03-28 09:00:00', NOW(), NULL);

-- ============================================================================
-- INSERT DATA - AUDIT LOGS (Sample audit trail)
-- ============================================================================
INSERT INTO "audit_logs" ("id", "action", "entity_type", "entity_id", "user_id", "ip_address", "user_agent", "details", "status", "timestamp") VALUES
('audit-01', 'Login', 'User', 'user-01', 'user-01', '192.168.1.100', 'Mozilla/5.0...', '{"email": "jean@kfh.rw"}', 'success', '2026-03-28 14:30:00'),
('audit-02', 'Patient_Created', 'Patient', 'pat-01', 'user-02', '192.168.1.101', 'Mozilla/5.0...', '{"name": "Emmanuel Niyonzima", "national_id": "1200987654321001"}', 'success', '2026-03-27 10:15:00'),
('audit-03', 'Referral_Created', 'Referral', 'ref-1001', 'user-01', '192.168.1.100', 'Mozilla/5.0...', '{"patient_name": "Chantal Habimana", "priority": "Urgent"}', 'success', '2026-03-28 09:00:00'),
('audit-04', 'Status_Changed', 'Referral', 'ref-1005', 'user-01', '192.168.1.100', 'Mozilla/5.0...', '{"old_status": "pending", "new_status": "approved"}', 'success', '2026-03-24 08:45:00'),
('audit-05', 'User_Updated', 'User', 'user-02', 'user-01', '192.168.1.100', 'Mozilla/5.0...', '{"role": "clinician"}', 'success', '2026-03-25 16:20:00'),
('audit-06', 'Data_Accessed', 'Patient', 'pat-05', 'user-02', '192.168.1.101', 'Mozilla/5.0...', '{"action": "viewed_patient_details"}', 'success', '2026-03-28 14:00:00');

-- ============================================================================
-- INSERT DATA - NOTIFICATIONS (Sample notifications)
-- ============================================================================
INSERT INTO "notifications" ("id", "title", "message", "type", "read", "user_id", "created_at") VALUES
('notif-01', 'Patient Data Shared', 'Patient data for Eric Ndizeye (REF-1008) has been shared by King Faisal Hospital.', 'info', FALSE, 'user-02', NOW() - INTERVAL '2 hours'),
('notif-02', 'Referral Status Updated', 'Referral REF-1008 status changed to completed.', 'success', TRUE, 'user-02', NOW() - INTERVAL '4 hours'),
('notif-03', 'Referral Status Updated', 'Referral REF-1007 status changed to approved.', 'success', TRUE, 'user-02', NOW() - INTERVAL '5 hours'),
('notif-04', 'Referral Rejected', 'Referral REF-1006 has been rejected by receiving hospital.', 'warning', FALSE, 'user-02', NOW() - INTERVAL '6 hours');

-- ============================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for referrals with patient and hospital names
CREATE OR REPLACE VIEW v_referrals_detailed AS
SELECT 
  r.id,
  r.patient_id,
  p.name AS patient_name,
  p.national_id,
  p.dob,
  p.gender,
  r.reason,
  r.status,
  r.priority,
  r.department,
  h1.name AS requesting_hospital,
  h2.name AS receiving_hospital,
  r.created_at,
  r.completed_at,
  CASE 
    WHEN r.status = 'completed' THEN EXTRACT(DAY FROM r.completed_at - r.created_at)
    ELSE NULL
  END AS days_to_complete
FROM "referrals" r
JOIN "patients" p ON r.patient_id = p.id
JOIN "hospitals" h1 ON r.requesting_hospital_id = h1.id
JOIN "hospitals" h2 ON r.receiving_hospital_id = h2.id;

-- View for referral statistics by hospital
CREATE OR REPLACE VIEW v_referral_statistics AS
SELECT 
  h.id,
  h.name AS hospital_name,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN r.status = 'approved' THEN 1 END) AS approved_count,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) AS completed_count,
  COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) AS rejected_count,
  COUNT(*) AS total_referrals
FROM "hospitals" h
LEFT JOIN "referrals" r ON (h.id = r.requesting_hospital_id OR h.id = r.receiving_hospital_id)
GROUP BY h.id, h.name;

-- View for users by hospital
CREATE OR REPLACE VIEW v_users_by_hospital AS
SELECT 
  h.id AS hospital_id,
  h.name AS hospital_name,
  COUNT(*) AS user_count,
  STRING_AGG(u.full_name, ', ') AS user_names
FROM "hospitals" h
LEFT JOIN "users" u ON h.id = u.hospital_id
GROUP BY h.id, h.name;

-- ============================================================================
-- VERIFY DATA INSERTION
-- ============================================================================
-- Run these SELECT statements to verify the data was inserted correctly

-- Check hospitals
-- SELECT COUNT(*) as hospital_count FROM "hospitals";
-- SELECT * FROM "hospitals";

-- Check users
-- SELECT COUNT(*) as user_count FROM "users";
-- SELECT * FROM "users";

-- Check patients
-- SELECT COUNT(*) as patient_count FROM "patients";
-- SELECT * FROM "patients";

-- Check referrals
-- SELECT COUNT(*) as referral_count FROM "referrals";
-- SELECT * FROM "referrals";

-- Check audit logs
-- SELECT COUNT(*) as audit_count FROM "audit_logs";
-- SELECT * FROM "audit_logs";

-- Check notifications
-- SELECT COUNT(*) as notification_count FROM "notifications";
-- SELECT * FROM "notifications";

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 1. Password Hash: The password hash above is for password123
--    To generate your own: Use bcryptjs with 10 rounds
--
-- 2. Foreign Keys: All foreign keys are set with proper constraints
--    - ON DELETE CASCADE for child tables (users, patients, referrals depend on hospitals)
--    - ON DELETE RESTRICT for referrals (hospitals can't be deleted if referrals exist)
--
-- 3. Indexes: Created on commonly queried columns for performance
--
-- 4. Constraints: 
--    - UNIQUE on email for users
--    - UNIQUE on national_id for patients
--    - CHECK constraints for roles, genders, statuses, priorities
--
-- 5. Views: Created for common reporting queries
--    - v_referrals_detailed: Shows referrals with full patient and hospital info
--    - v_referral_statistics: Statistics by hospital
--    - v_users_by_hospital: Users grouped by hospital
--
-- ============================================================================
