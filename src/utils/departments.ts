/**
 * Department Validation Utilities
 * Provides validation and utility functions for medical departments
 */

import { getAllDepartments, getDepartmentsForHospital, hospitalHasDepartment } from '../data/departments';

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
  receivingHospitalId: string
): DepartmentValidationResult {
  const errors: string[] = [];

  if (!department || !department.trim()) {
    errors.push('Department is required');
    return { isValid: false, errors };
  }

  if (!hospitalHasDepartment(receivingHospitalId, department)) {
    errors.push(`The selected hospital does not have a ${department} department`);
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    department: department.trim(),
  };
}

/**
 * Validate if a department exists in the system
 */
export function isDepartmentValid(departmentName: string): boolean {
  const allDepartments = getAllDepartments();
  return allDepartments.some(d => d.name === departmentName);
}

/**
 * Get all valid departments as an array of names
 */
export function getAllValidDepartments(): string[] {
  return getAllDepartments().map(d => d.name);
}

/**
 * Suggest similar departments if input doesn't match exactly
 * Useful for fuzzy matching or typo correction
 */
export function suggestDepartments(input: string, limit: number = 5): string[] {
  const allDepartments = getAllValidDepartments();
  const lowercaseInput = input.toLowerCase();

  return allDepartments
    .filter(dept => dept.toLowerCase().includes(lowercaseInput))
    .slice(0, limit);
}

/**
 * Check if two hospitals share any departments
 */
export function hasSharedDepartments(hospital1Id: string, hospital2Id: string): boolean {
  const dept1 = new Set(getDepartmentsForHospital(hospital1Id).map(d => d.name));
  const dept2 = new Set(getDepartmentsForHospital(hospital2Id).map(d => d.name));

  for (const dept of dept1) {
    if (dept2.has(dept)) {
      return true;
    }
  }

  return false;
}

/**
 * Get common departments between two hospitals
 */
export function getCommonDepartments(hospital1Id: string, hospital2Id: string): string[] {
  const dept1 = new Set(getDepartmentsForHospital(hospital1Id).map(d => d.name));
  const dept2 = getDepartmentsForHospital(hospital2Id).map(d => d.name);

  return dept2.filter(dept => dept1.has(dept));
}
