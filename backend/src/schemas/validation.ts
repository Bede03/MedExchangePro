import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'clinician', 'registrar', 'hospital_staff']),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
});

// User Schemas
export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'clinician', 'registrar', 'hospital_staff']).optional(),
});

// Patient Schemas
export const createPatientSchema = z.object({
  name: z.string().min(2, 'Patient name is required'),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  phone: z.string().min(9, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  nationalId: z.string().min(10, 'Invalid national ID'),
});

export const updatePatientSchema = createPatientSchema.partial();

// Department options for referrals
const DEPARTMENTS = [
  'General Surgery',
  'Orthopedic Surgery',
  'Neurosurgery',
  'Urology',
  'Plastic Surgery',
  'Cardio-thoracic Surgery',
  'Digestive/GI Surgery',
  'Hepatobiliary Surgery',
  'Cardiology',
  'Interventional Cardiology',
  'Internal Medicine',
  'Nephrology',
  'Endocrinology',
  'Pulmonology',
  'Gastroenterology',
  'Dermatology',
  'Haematology',
  'Oncology',
  'Pediatrics',
  'NICU/Neonatology',
  'Gynecology & Obstetrics',
  'Maternal-Fetal Medicine',
  'Emergency Medicine',
  'Anesthesiology',
  'ENT',
  'Ophthalmology',
  'Dentistry/Oral & Maxillofacial',
  'Radiology',
  'Laboratory Services',
  'Pathology',
  'Mental Health / Psychiatry',
] as const;

// Referral Schemas
export const createReferralSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters'),
  priority: z.enum(['Emergency', 'Urgent', 'Routine']),
  department: z.enum(DEPARTMENTS as any, {
    errorMap: () => ({ message: `Department must be one of: ${DEPARTMENTS.join(', ')}` }),
  }),
  receivingHospitalId: z.string().min(1, 'Receiving hospital is required'),
});

export const updateReferralSchema = z.object({
  status: z.enum(['pending', 'approved', 'completed', 'rejected']).optional(),
  reason: z.string().min(10).optional(),
  priority: z.enum(['Emergency', 'Urgent', 'Routine']).optional(),
  department: z.enum(DEPARTMENTS as any).optional(),
});

// Shared Patient Records Schema
export const sharePatientRecordsSchema = z.object({
  referralId: z.string().min(1, 'Referral ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  requestingHospitalId: z.string().min(1, 'Requesting hospital ID is required'),
  respondingHospitalId: z.string().min(1, 'Receiving hospital ID is required'),
  testResults: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  vitalsLastRecorded: z.string().optional().nullable(),
  currentDiagnosis: z.string().optional().nullable(),
  clinicalNotes: z.string().max(2000).optional().nullable(),
});

// Hospital Schemas
export const createHospitalSchema = z.object({
  name: z.string().min(2, 'Hospital name is required'),
  location: z.string().min(5, 'Hospital location is required'),
});

export const updateHospitalSchema = createHospitalSchema.partial();

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;
export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
export type SharePatientRecordsInput = z.infer<typeof sharePatientRecordsSchema>;
