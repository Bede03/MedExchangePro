/**
 * Medical Departments for CHUK and KFH Hospitals
 * Based on actual specialty availability at each facility
 */

export interface DepartmentCategory {
  name: string;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  category: DepartmentCategory['name'];
  chuk: boolean;
  kfh: boolean;
}

// Departments available at both hospitals
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
] as const;

// CHUK-only departments
const CHUK_ONLY = [
  'Plastic Surgery',
  'Mental Health / Psychiatry',
] as const;

// KFH-only departments
const KFH_ONLY = [
  'Cardio-thoracic Surgery',
  'Interventional Cardiology',
  'Digestive/GI Surgery',
  'Hepatobiliary Surgery',
  'Gastroenterology',
  'Haematology',
  'Pathology',
] as const;

export const DEPARTMENT_CATEGORIES: DepartmentCategory[] = [
  {
    name: 'Surgery',
    departments: [
      'General Surgery',
      'Orthopedic Surgery',
      'Neurosurgery',
      'Urology',
      'Cardio-thoracic Surgery',
      'Digestive/GI Surgery',
      'Hepatobiliary Surgery',
      'Plastic Surgery',
    ].map(dept => createDepartment(dept, 'Surgery')),
  },
  {
    name: 'Cardiology',
    departments: [
      'Cardiology',
      'Interventional Cardiology',
    ].map(dept => createDepartment(dept, 'Cardiology')),
  },
  {
    name: 'Internal Medicine',
    departments: [
      'Internal Medicine',
      'Nephrology',
      'Endocrinology',
      'Pulmonology',
      'Gastroenterology',
      'Haematology',
    ].map(dept => createDepartment(dept, 'Internal Medicine')),
  },
  {
    name: 'Oncology',
    departments: [
      'Oncology',
    ].map(dept => createDepartment(dept, 'Oncology')),
  },
  {
    name: 'Women & Children',
    departments: [
      'Pediatrics',
      'NICU/Neonatology',
      'Gynecology & Obstetrics',
      'Maternal-Fetal Medicine',
    ].map(dept => createDepartment(dept, 'Women & Children')),
  },
  {
    name: 'Emergency & Critical Care',
    departments: [
      'Emergency Medicine',
      'Anesthesiology',
    ].map(dept => createDepartment(dept, 'Emergency & Critical Care')),
  },
  {
    name: 'Sensory & ENT',
    departments: [
      'ENT',
      'Ophthalmology',
      'Dentistry/Oral & Maxillofacial',
    ].map(dept => createDepartment(dept, 'Sensory & ENT')),
  },
  {
    name: 'Diagnostics & Support',
    departments: [
      'Radiology',
      'Laboratory Services',
      'Pathology',
    ].map(dept => createDepartment(dept, 'Diagnostics & Support')),
  },
  {
    name: 'Mental Health',
    departments: [
      'Mental Health / Psychiatry',
    ].map(dept => createDepartment(dept, 'Mental Health')),
  },
  {
    name: 'Dermatology',
    departments: [
      'Dermatology',
    ].map(dept => createDepartment(dept, 'Dermatology')),
  },
];

function createDepartment(name: string, category: string): Department {
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
  return {
    id,
    name,
    category,
    chuk: isChukDepartment(name),
    kfh: isKfhDepartment(name),
  };
}

function isChukDepartment(name: string): boolean {
  return SHARED_DEPARTMENTS.includes(name as any) || CHUK_ONLY.includes(name as any);
}

function isKfhDepartment(name: string): boolean {
  return SHARED_DEPARTMENTS.includes(name as any) || KFH_ONLY.includes(name as any);
}

/**
 * Get all departments available at a specific hospital
 */
const CHUK_IDENTIFIERS = ['hosp-01', 'CHUK', 'chuk'];
const KFH_IDENTIFIERS = ['hosp-02', 'King Faisal Hospital', 'KFH', 'kfh'];

function isChukIdOrName(val: string): boolean {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return CHUK_IDENTIFIERS.map(i => i.toLowerCase()).includes(normalized);
}

function isKfhIdOrName(val: string): boolean {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return KFH_IDENTIFIERS.map(i => i.toLowerCase()).includes(normalized);
}

export function getDepartmentsForHospital(hospitalId: string, hospitalName?: string): Department[] {
  const allDepartments = DEPARTMENT_CATEGORIES.flatMap(cat => cat.departments);

  const idCandidates = [hospitalId, hospitalName].filter(Boolean) as string[];
  const isChuk = idCandidates.some(isChukIdOrName);
  const isKfh = idCandidates.some(isKfhIdOrName);

  if (isChuk) {
    return allDepartments.filter(d => d.chuk);
  } else if (isKfh) {
    return allDepartments.filter(d => d.kfh);
  }

  // Fallback: no match, return shared only (safe default)
  return allDepartments.filter(d => d.chuk || d.kfh);
}

/**
 * Get all departments (flat list)
 */
export function getAllDepartments(): Department[] {
  return DEPARTMENT_CATEGORIES.flatMap(cat => cat.departments);
}

/**
 * Check if a hospital has a specific department
 */
export function hospitalHasDepartment(hospitalId: string, departmentName: string, hospitalName?: string): boolean {
  const idCandidates = [hospitalId, hospitalName].filter(Boolean) as string[];
  const isChuk = idCandidates.some(isChukIdOrName);
  const isKfh = idCandidates.some(isKfhIdOrName);

  if (isChuk) {
    return isChukDepartment(departmentName);
  } else if (isKfh) {
    return isKfhDepartment(departmentName);
  }

  return false;
}

/**
 * Get shared departments between two hospitals
 */
export function getSharedDepartments(): string[] {
  return Array.from(SHARED_DEPARTMENTS);
}

/**
 * Get hospital-specific departments
 */
export function getHospitalSpecificDepartments(hospitalId: string, hospitalName?: string): string[] {
  const idCandidates = [hospitalId, hospitalName].filter(Boolean) as string[];
  const isChuk = idCandidates.some(isChukIdOrName);
  const isKfh = idCandidates.some(isKfhIdOrName);

  if (isChuk) {
    return Array.from(CHUK_ONLY);
  } else if (isKfh) {
    return Array.from(KFH_ONLY);
  }

  return [];
}

/**
 * Get hospital department summary
 */
export interface HospitalCapabilitiesSummary {
  hospitalId: string;
  hospitalName: string;
  totalDepartments: number;
  sharedDepartments: number;
  uniqueDepartments: number;
  departments: Department[];
  uniqueDepts: string[];
}

export function getHospitalCapabilitiesSummary(hospitalId: string, hospitalName: string): HospitalCapabilitiesSummary {
  const departments = getDepartmentsForHospital(hospitalId, hospitalName);
  const unique = getHospitalSpecificDepartments(hospitalId, hospitalName);

  return {
    hospitalId,
    hospitalName,
    totalDepartments: departments.length,
    sharedDepartments: departments.length - unique.length,
    uniqueDepartments: unique.length,
    departments,
    uniqueDepts: unique,
  };
}
