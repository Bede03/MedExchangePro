/**
 * Backend Department Validation Utilities
 * Provides validation and utility functions for medical departments
 */

// Department definitions matching frontend
const SHARED_DEPARTMENTS = [
  'General Surgery',
  'Orthopedic Surgery',
  'Neurosurgery',
  'Urology',
  'Cardiology',
  'Internal Medicine',
  'Nephrology',
  'Endocrinology',
  'Pulmonology',
  'Dermatology',
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
];

const CHUK_ONLY = [
  'Plastic Surgery',
  'Mental Health / Psychiatry',
];

const KFH_ONLY = [
  'Cardio-thoracic Surgery',
  'Interventional Cardiology',
  'Digestive/GI Surgery',
  'Hepatobiliary Surgery',
  'Gastroenterology',
  'Haematology',
  'Pathology',
];

// Map hospital names to IDs (adjust based on your actual setup)
const HOSPITAL_DEPARTMENTS: Record<string, string[]> = {
  'hosp-01': [ // CHUK
    ...SHARED_DEPARTMENTS,
    ...CHUK_ONLY,
  ],
  'hosp-02': [ // KFH
    ...SHARED_DEPARTMENTS,
    ...KFH_ONLY,
  ],
};

export interface DepartmentValidationResult {
  isValid: boolean;
  errors: string[];
  department?: string;
}

/**
 * Validate a referral's department against hospital capabilities
 */
export function validateReferralDepartment(
  department: string,
  receivingHospitalId: string,
  receivingHospitalName?: string
): DepartmentValidationResult {
  const errors: string[] = [];

  if (!department || !department.trim()) {
    errors.push('Department is required');
    return { isValid: false, errors };
  }

  const normalizedHospitalName = receivingHospitalName?.trim().toLowerCase();
  let hospitalDepartments = HOSPITAL_DEPARTMENTS[receivingHospitalId];

  if (!hospitalDepartments && normalizedHospitalName) {
    if (normalizedHospitalName === 'chuk') {
      hospitalDepartments = [...SHARED_DEPARTMENTS, ...CHUK_ONLY];
    } else if (normalizedHospitalName === 'king faisal hospital' || normalizedHospitalName === 'kfh') {
      hospitalDepartments = [...SHARED_DEPARTMENTS, ...KFH_ONLY];
    }
  }

  if (!hospitalDepartments) {
    errors.push('Invalid receiving hospital');
    return { isValid: false, errors };
  }

  const trimmedDept = department.trim();
  if (!hospitalDepartments.includes(trimmedDept)) {
    errors.push(`The hospital does not have a ${trimmedDept} department`);
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    department: trimmedDept,
  };
}

/**
 * Get all valid departments
 */
export function getAllValidDepartments(): string[] {
  const all = new Set<string>([...SHARED_DEPARTMENTS, ...CHUK_ONLY, ...KFH_ONLY]);
  return Array.from(all).sort();
}

/**
 * Get departments available at a specific hospital
 */
export function getHospitalDepartments(hospitalId: string): string[] {
  return HOSPITAL_DEPARTMENTS[hospitalId] || [];
}

/**
 * Check if a hospital has a specific department
 */
export function hospitalHasDepartment(hospitalId: string, departmentName: string): boolean {
  const departments = getHospitalDepartments(hospitalId);
  return departments.includes(departmentName);
}

/**
 * Check if a department exists in the system
 */
export function isDepartmentValid(departmentName: string): boolean {
  const allDepartments = getAllValidDepartments();
  return allDepartments.includes(departmentName);
}

/**
 * Get shared departments between two hospitals
 */
export function getSharedDepartments(hospital1Id: string, hospital2Id: string): string[] {
  const dept1 = new Set(getHospitalDepartments(hospital1Id));
  const dept2 = getHospitalDepartments(hospital2Id);

  return dept2.filter(dept => dept1.has(dept));
}

/**
 * Check if two hospitals share any departments
 */
export function hasSharedDepartments(hospital1Id: string, hospital2Id: string): boolean {
  return getSharedDepartments(hospital1Id, hospital2Id).length > 0;
}
