# PostgreSQL Database Setup Guide

Complete PostgreSQL commands to create all tables and insert mock data for MedExchangePro.

---

## 📋 What's Included

The `database_setup.sql` file contains:

✅ **7 Tables** with proper relationships:
- `hospitals` - Base entity (2 hospitals)
- `users` - Hospital staff (3 users)
- `patients` - Patient records (6 patients)
- `referrals` - Medical referrals (8 referrals)
- `audit_logs` - Action tracking (6 sample logs)
- `notifications` - System notifications (4 samples)

✅ **Indexes** on all commonly queried columns for performance

✅ **Foreign Keys** with proper CASCADE/RESTRICT rules

✅ **3 Views** for reporting and analytics

✅ **Mock Data** matching the frontend mockData.ts

---

## 🚀 How to Run

### Option 1: Using psql Command Line

```bash
# Navigate to the backend folder
cd backend

# Run the SQL file
psql -U postgres -d medexchange -f database_setup.sql
```

### Option 2: Using pgAdmin

1. Open pgAdmin GUI
2. Right-click your `medexchange` database
3. Select **"Query Tool"**
4. Open `database_setup.sql` file content
5. Click **"Execute"** button

### Option 3: Using DBeaver

1. Open DBeaver
2. Right-click `medexchange` database → **New → SQL Script**
3. Copy contents of `database_setup.sql`
4. Press `Ctrl+Enter` to execute

### Option 4: Using VSCode PostgreSQL Extension

1. Install "PostgreSQL" extension by Chris Kolkman
2. Connect to your database
3. Paste the SQL file contents and execute

---

## 📊 Data Structure Overview

### 1. **HOSPITALS** (2 records)
```
CHUK                         → hosp-01
King Faisal Hospital         → hosp-02
```

### 2. **USERS** (3 records - by role)
```
Jean Claude        (admin)              @ King Faisal Hospital
Izere Mpuhwe       (clinician)          @ CHUK
Aline Uwase        (hospital_staff)     @ CHUK
```

**Test Credentials:**
- Email: `jean@kfh.rw` | Password: `password123` | Role: Admin
- Email: `izere@chuk.rw` | Password: `password123` | Role: Clinician
- Email: `aline@chuk.rw` | Password: `password123` | Role: Staff

### 3. **PATIENTS** (6 records)
```
Emmanuel Niyonzima      @ CHUK (hosp-01)
Aline Uwase             @ CHUK (hosp-01)
Jean Pierre             @ King Faisal (hosp-02)
Chantal Habimana        @ King Faisal (hosp-02)
Eric Ndizeye            @ CHUK (hosp-01)
Sandrine Mukasine       @ King Faisal (hosp-02)
```

### 4. **REFERRALS** (8 records)
```
Status Breakdown:
- Pending (2)    → ref-1004, ref-1001 (awaiting action)
- Approved (2)   → ref-1005, ref-1002 (approved, waiting completion)
- Completed (3)  → ref-1008, ref-1007, ref-1003 (finished)
- Rejected (1)   → ref-1006 (rejected)

Priority Distribution:
- Emergency (3)  → ref-1008, ref-1006, ref-1003
- Urgent (3)     → ref-1007, ref-1005, ref-1001
- Routine (2)    → ref-1004, ref-1002

Departments:
- Cardiology, Surgery, Pediatrics, Orthopedics, Radiology, ICU
```

### 5. **AUDIT LOGS** (6 sample entries)
```
- Login events
- Patient creation
- Referral creation & status changes
- User updates
```

### 6. **NOTIFICATIONS** (4 samples)
```
- Referral status updates
- Patient data sharing notifications
```

---

## 🔐 Database Relationships

```
hospitals (1) ←→ (many) users
   ↑                    ↑
   |                    └─→ audit_logs
   |
   ├────────────────────────────────────┐
   |                                    |
patients                            (references)
   |                                    |
   └─→ referrals ←─────────────────────┘
```

**Key Constraints:**
- Users → Hospitals: ON DELETE CASCADE
- Patients → Hospitals: ON DELETE CASCADE
- Referrals → Patients: ON DELETE CASCADE
- Referrals → Hospitals: ON DELETE RESTRICT (can't delete hospital with active referrals)
- AuditLogs → Users: ON DELETE RESTRICT

---

## 🛠️ Useful SQL Queries After Setup

### View All Data

```sql
-- List all hospitals
SELECT * FROM "hospitals";

-- List all users with their hospitals
SELECT u.full_name, u.email, u.role, h.name AS hospital
FROM "users" u
JOIN "hospitals" h ON u.hospital_id = h.id;

-- List all patients
SELECT p.name, p.gender, p.dob, h.name AS hospital
FROM "patients" p
JOIN "hospitals" h ON p.hospital_id = h.id;

-- List all referrals with details
SELECT r.id, p.name AS patient, r.reason, r.status, r.priority, 
       h1.name AS from_hospital, h2.name AS to_hospital
FROM "referrals" r
JOIN "patients" p ON r.patient_id = p.id
JOIN "hospitals" h1 ON r.requesting_hospital_id = h1.id
JOIN "hospitals" h2 ON r.receiving_hospital_id = h2.id;

-- View statistics
SELECT * FROM v_referral_statistics;
SELECT * FROM v_users_by_hospital;
SELECT * FROM v_referrals_detailed;
```

### Get Referral Count by Status

```sql
SELECT 
  status,
  COUNT(*) as count
FROM "referrals"
GROUP BY status
ORDER BY count DESC;
```

### Get User Count by Role

```sql
SELECT 
  role,
  COUNT(*) as count
FROM "users"
GROUP BY role
ORDER BY count DESC;
```

### Get Audit Log History

```sql
SELECT 
  action,
  entity_type,
  u.full_name,
  timestamp
FROM "audit_logs" a
JOIN "users" u ON a.user_id = u.id
ORDER BY timestamp DESC
LIMIT 10;
```

### Get Referrals By Hospital

```sql
SELECT 
  h.name,
  COUNT(*) as total_referrals,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed
FROM "hospitals" h
LEFT JOIN "referrals" r ON (h.id = r.requesting_hospital_id OR h.id = r.receiving_hospital_id)
GROUP BY h.id, h.name;
```

---

## ⚠️ Important Notes

### Password Hashing
The password hash in the SQL is: `$2a$10$Lx5q8yFvR1V8.Z5pK9x7eezx7h8g3q9z5vn6m2c8b7j9h3x1k4y6u`

This hash represents `password123` using bcryptjs with 10 rounds.

**In Production:**
- Generate new password hashes using your app's auth service
- Never use plain text passwords in SQL

### Indexes for Performance
Created on:
- `hospitals.name`
- `users.email, users.hospital_id`
- `patients.hospital_id, patients.national_id, patients.name`
- `referrals.patient_id, requesting_hospital_id, receiving_hospital_id, status, created_at`
- `audit_logs.user_id, entity_id, timestamp, action`
- `notifications.user_id, created_at`

### Views for Reporting
Three pre-built views for analytics:

```sql
-- Join referrals with patient and hospital details
SELECT * FROM v_referrals_detailed;

-- Get statistics by hospital
SELECT * FROM v_referral_statistics;

-- Get users organized by hospital
SELECT * FROM v_users_by_hospital;
```

---

## 🔄 Data Flow in Frontend

### Login Process
1. User submits credentials
2. Backend checks against `users` table
3. Returns JWT token
4. Frontend stores token in localStorage

### Patient Management
1. Clinician views patients (filters by their hospital)
2. Data comes from `patients` table
3. Can create/update via API

### Referral Workflow
```
1. PENDING (Created by requesting hospital)
   ↓
2. APPROVED or REJECTED (Receiving hospital decision)
   ↓
3. COMPLETED (After treatment)

Each status change is logged in audit_logs
```

### Audit Trail
Every action (login, create, update) generates an audit log entry with:
- Action type
- Entity type and ID
- User ID
- IP address
- Timestamp
- Action details (JSON)

---

## 🧹 Cleanup Commands

If you need to reset the database:

```sql
-- Drop all tables (in order to respect foreign keys)
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "referrals" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "hospitals" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;

-- Or drop entire schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

## ✅ Verification Checklist

After running the SQL, verify everything:

```bash
# Check table counts
psql -U postgres -d medexchange -c "SELECT 'hospitals' as table_name, COUNT(*) as count FROM hospitals UNION ALL SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'patients', COUNT(*) FROM patients UNION ALL SELECT 'referrals', COUNT(*) FROM referrals UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;"

# Should output:
# table_name  | count
# ------------|------
# hospitals   |     2
# users       |     3
# patients    |     6
# referrals   |     8
# audit_logs  |     6
```

---

## 📚 Integration with Backend

The backend (Node.js + Express + Prisma) uses these tables via:

```typescript
// Prisma automatically creates these models from the SQL schema
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Access data
const hospitals = await db.hospital.findMany();
const referrals = await db.referral.findMany({
  include: { patient: true, requestingHospital: true }
});
```

The SQL schema matches the Prisma schema defined in `backend/prisma/schema.prisma`

---

## 🎯 Next Steps

1. ✅ Run `database_setup.sql` to create tables and insert data
2. ✅ Verify with `npm run seed` or Prisma
3. ✅ Start backend: `npm run dev`
4. ✅ Start frontend: `npm run dev` (in root folder)
5. ✅ Test login with credentials above
6. ✅ Navigate through application to verify data

---

**All data is set up and ready to use! 🎉**
