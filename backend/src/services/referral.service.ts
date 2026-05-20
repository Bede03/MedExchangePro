import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { validateReferralDepartment, hospitalHasDepartment } from '../utils/departments';
import { notificationService } from './notification.service';
import { patientService } from './patient.service';
import { kfhOracleService } from './kfh-oracle.service';
import { externalMysqlService } from './external-mysql.service';

const prisma = new PrismaClient();

// Helper to determine which external database to query based on hospital
async function getPatientMedicalDataFromExternalDB(nationalId: string, hospitalName: string, fallbackPatient?: any) {
  const hospitalLower = hospitalName.toLowerCase();
  const isPascalHabimana = fallbackPatient?.name?.toLowerCase().includes('pascal habimana');
  
  if (isPascalHabimana) {
    console.log('[DEBUG] Pascal Habimana lookup started - nationalId:', nationalId, 'hospital:', hospitalName);
  }
  
  // Check if it's KFH (King Faisal Hospital) - use Oracle
  if (hospitalLower.includes('king faisal') || hospitalLower.includes('kfh')) {
    try {
      console.log('[DEBUG] Fetching patient data from KFH Oracle for nationalId:', nationalId);
      let kfhPatient = await kfhOracleService.getPatientByNationalId(nationalId);
      
      if (!kfhPatient && fallbackPatient?.name && fallbackPatient?.dob) {
        const [firstName, ...lastParts] = String(fallbackPatient.name).split(' ').filter(Boolean);
        const lastName = lastParts.join(' ');
        if (firstName && lastName) {
          console.log('[DEBUG] Fallback KFH lookup by name/dob:', firstName, lastName, fallbackPatient.dob);
          if (isPascalHabimana) {
            console.log('[DEBUG] Pascal Habimana: Using name/dob fallback for KFH');
          }
          kfhPatient = await kfhOracleService.getPatientByNameDob(firstName, lastName, fallbackPatient.dob);
        }
      }

      if (kfhPatient) {
        if (isPascalHabimana) {
          console.log('[DEBUG] Pascal Habimana: Found in KFH Oracle');
        }
        // Get additional medical data
        const [diagnoses, prescriptions, labResults, encounters] = await Promise.all([
          kfhOracleService.getDiagnosesByPatientId(kfhPatient.PATIENT_ID),
          kfhOracleService.getPrescriptionsByPatientId(kfhPatient.PATIENT_ID),
          kfhOracleService.getLabResultsByPatientId(kfhPatient.PATIENT_ID),
          kfhOracleService.getEncountersByPatientId(kfhPatient.PATIENT_ID)
        ]);

        return {
          source: 'KFH Oracle',
          patient: kfhPatient,
          diagnoses,
          prescriptions,
          labResults,
          encounters
        };
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching from KFH Oracle:', error);
    }
  }
  
  // Check if it's CHUK - use MySQL
  if (hospitalLower.includes('chuk') || hospitalLower.includes('university teaching')) {
    try {
      console.log('[DEBUG] Fetching patient data from CHUK MySQL for nationalId:', nationalId);
      let chukPatients = await externalMysqlService.getPatientRecordsByNationalId(nationalId);
      
      if ((!chukPatients || chukPatients.length === 0) && fallbackPatient?.name && fallbackPatient?.dob) {
        console.log('[DEBUG] Fallback CHUK lookup by name/dob:', fallbackPatient.name, fallbackPatient.dob);
        if (isPascalHabimana) {
          console.log('[DEBUG] Pascal Habimana: Using name/dob fallback for CHUK');
        }
        chukPatients = await externalMysqlService.getPatientRecordsByNameDob(fallbackPatient.name, fallbackPatient.dob);
      }

      if (chukPatients && chukPatients.length > 0) {
        if (isPascalHabimana) {
          console.log('[DEBUG] Pascal Habimana: Found in CHUK MySQL');
        }
        return {
          source: 'CHUK MySQL',
          patient: chukPatients[0]
        };
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching from CHUK MySQL:', error);
    }
  }
  
  if (isPascalHabimana) {
    console.log('[DEBUG] Pascal Habimana: No external data found');
  }
  return null;
}

// Format medical data for response
function normalizeGenderValue(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'm' || normalized === 'male') return 'male';
  if (normalized === 'f' || normalized === 'female') return 'female';
  return 'other';
}

function formatMedicalData(externalData: any) {
  if (!externalData) return {};
  
  const { source, patient, diagnoses, prescriptions, labResults, encounters } = externalData;
  
  // Format diagnoses
  let diagnosesStr = '';
  if (diagnoses && diagnoses.length > 0) {
    diagnosesStr = diagnoses.map((d: any) => 
      `${d.ICD10_CODE}: ${d.DESCRIPTION || 'Unknown'}${d.IS_PRIMARY ? ' (Primary)' : ''}`
    ).join('; ');
  }
  
  // Format prescriptions/medications
  let medicationsStr = '';
  if (prescriptions && prescriptions.length > 0) {
    medicationsStr = prescriptions.map((p: any) => 
      `${p.GENERIC_NAME || p.MED_ID || p.medicationName || 'Medication'} - ${p.DOSE || p.dose || ''} ${p.FREQUENCY || ''} for ${p.DURATION_DAYS || p.durationDays || 'N/A'} days`
    ).join('; ');
  }
  
  // Format lab results
  let labResultsStr = '';
  if (labResults && labResults.length > 0) {
    labResultsStr = labResults.slice(0, 10).map((lr: any) => 
      `${lr.PARAMETER || lr.parameter}: ${lr.VALUE || lr.value} ${lr.UNIT || lr.unit || ''} (${lr.REF_RANGE || lr.refRange || 'N/A'})`
    ).join('; ');
  }
  
  // Format encounters as medical history
  let medicalHistory = '';
  if (encounters && encounters.length > 0) {
    medicalHistory = encounters.slice(0, 5).map((e: any) => 
      `${e.TYPE || e.type} - ${new Date(e.ENCOUNTER_TIME || e.encounterTime).toLocaleDateString()}`
    ).join('; ');
  }
  
  return {
    medical_history: medicalHistory || 'No medical history available',
    lab_results: labResultsStr || 'No lab results available',
    diagnoses: diagnosesStr || 'No diagnoses available',
    current_medications: medicationsStr || 'No current medications',
    allergies: 'Not recorded', // Would need separate table for this
    vitals: 'Not recorded', // Would need separate table for this
    patient_documents: 'No documents available', // Would need document management system
    _external_source: source
  };
}

function formatExternalDemographics(patient: any) {
  if (!patient) return {};
  const name = patient.name || [patient.FIRST_NAME, patient.LAST_NAME].filter(Boolean).join(' ').trim();
  const dob = patient.dob || (patient.DOB ? String(patient.DOB) : undefined);
  const gender = normalizeGenderValue(patient.gender || patient.GENDER);
  const phone = patient.phone || patient.PHONE;
  const nationalId = patient.national_id || patient.NATIONAL_ID;
  const address = patient.address || patient.ADDRESS;

  return {
    patient_name: name || undefined,
    patient_dob: dob || undefined,
    patient_gender: gender || undefined,
    patient_phone: phone || undefined,
    patient_national_id: nationalId || undefined,
    patient_address: address || undefined,
  };
}

async function getPatientMedicalDataUsingPatientService(patient: any, receivingHospitalName: string): Promise<any> {
  if (!patient?.id) return null;
  try {
    // Determine the hospital to query based on the receiving hospital name
    let hospitalId = patient.hospitalId;
    
    // If we're looking in a specific hospital context (receiving), try to find that hospital ID
    if (receivingHospitalName) {
      const targetHospital = await prisma.hospital.findFirst({
        where: { name: { contains: receivingHospitalName, mode: 'insensitive' } },
      });
      if (targetHospital) {
        hospitalId = targetHospital.id;
      }
    }

    const externalPatient = await patientService.getPatientById(patient.id, hospitalId);
    if (!externalPatient) return null;

    return {
      source: `${externalPatient.hospital?.name || 'External hospital'} database`,
      patient: externalPatient,
      diagnoses: externalPatient.diagnoses || [],
      prescriptions: externalPatient.medications || [],
      labResults: externalPatient.labResults || [],
      encounters: externalPatient.encounters || [],
    } as any;
  } catch (error) {
    console.error('[DEBUG] Fallback external lookup failed:', error);
    return null;
  }
}

export class ReferralService {
  async createReferral(data: any, currentUser: JwtPayload) {
    // Resolve the patient through the requesting hospital's external database.
    const patient = await patientService.getOrCreateLocalPatientFromIdentifier(
      data.patientId,
      currentUser.hospitalId
    );

    // Allow referrals for a patient that is identified by national ID, even if the local record
    // was created under a different hospital. The referral flow depends on shared national ID.

    // Verify receiving hospital exists
    const receivingHospital = await prisma.hospital.findUnique({
      where: { id: data.receivingHospitalId },
    });

    if (!receivingHospital) {
      throw new AppError(404, 'Receiving hospital not found');
    }

    // Validate department
    const deptValidation = validateReferralDepartment(
      data.department,
      data.receivingHospitalId,
      receivingHospital.name
    );
    if (!deptValidation.isValid) {
      throw new AppError(400, `Invalid department: ${deptValidation.errors.join(', ')}`);
    }

    // Generate next referral number
    const lastReferral = await prisma.referral.findFirst({
      orderBy: { referralNumber: 'desc' },
      select: { referralNumber: true },
    });
    const nextReferralNumber = (lastReferral?.referralNumber || 0) + 1;

    const storedReason = Array.isArray(data.reason)
      ? data.reason.join('; ')
      : data.reason;
    const reasonText = data.reasonDetails
      ? `${storedReason} - ${data.reasonDetails}`
      : storedReason;

    const referral = await prisma.referral.create({
      data: {
        referralNumber: nextReferralNumber,
        patientId: patient.id,
        reason: reasonText,
        priority: data.priority,
        department: deptValidation.department as string,
        attachmentUrl: data.attachmentUrl ?? null,
        requestingHospitalId: currentUser.hospitalId,
        receivingHospitalId: data.receivingHospitalId,
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    // Notify receiving hospital about new referral
    await notificationService.notifyNewReferral(
      data.receivingHospitalId,
      referral.patient.name,
      referral.priority,
      referral.requestingHospital.name
    );

    return referral;
  }

  async getReferralById(id: string, currentUser: JwtPayload) {
    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    // Verify user has access
    const hasAccess =
      referral.requestingHospitalId === currentUser.hospitalId ||
      referral.receivingHospitalId === currentUser.hospitalId ||
      currentUser.role === 'admin';

    if (!hasAccess) {
      throw new AppError(403, 'Unauthorized to view this referral');
    }

    // Fetch patient medical data from external database (CHUK or KFH)
    const nationalId = referral.patient.nationalId;
    const requestingHospitalName = referral.requestingHospital.name;
    const receivingHospitalName = referral.receivingHospital.name;

    // Try to get medical data from the requesting hospital's database
    let externalMedicalData = await getPatientMedicalDataFromExternalDB(
      nationalId,
      requestingHospitalName,
      referral.patient
    );

    // If not found, try receiving hospital
    if (!externalMedicalData) {
      externalMedicalData = await getPatientMedicalDataFromExternalDB(
        nationalId,
        receivingHospitalName,
        referral.patient
      );
    }

    // If national ID-based lookup fails, attempt a patient-service fallback using the receiving hospital context.
    if (!externalMedicalData) {
      externalMedicalData = await getPatientMedicalDataUsingPatientService(referral.patient, receivingHospitalName);
    }

    // Format and attach medical data to referral response
    const formattedMedicalData = formatMedicalData(externalMedicalData);
    const externalDemographics = formatExternalDemographics(externalMedicalData?.patient);

    // Return referral with external demographics and medical data when available
    return {
      ...referral,
      patient: {
        ...referral.patient,
        patient_name: externalDemographics.patient_name || referral.patient.name,
        patient_dob: externalDemographics.patient_dob || referral.patient.dob,
        patient_gender: externalDemographics.patient_gender || referral.patient.gender,
        patient_phone: externalDemographics.patient_phone || referral.patient.phone,
        patient_national_id: externalDemographics.patient_national_id || referral.patient.nationalId,
        patient_address: externalDemographics.patient_address || referral.patient.address,
        ...formattedMedicalData
      },
      _external_source: formattedMedicalData._external_source
    };
  }

  async getRespondingHospitalPatientData(referralId: string, currentUser: JwtPayload) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        patient: true,
        receivingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    if (referral.receivingHospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Only the responding hospital can access this patient data');
    }

    const nationalId = referral.patient.nationalId;
    const receivingHospitalName = referral.receivingHospital.name;

    console.log(`[DEBUG] Looking up responding hospital patient data by nationalId=${nationalId} for hospital=${receivingHospitalName}`);
    if (referral.patient.name?.toLowerCase().includes('pascal habimana')) {
      console.log('[DEBUG] Pascal Habimana: Responding hospital lookup started');
    }
    let externalMedicalData = await getPatientMedicalDataFromExternalDB(
      nationalId,
      receivingHospitalName,
      referral.patient
    );

    if (!externalMedicalData) {
      externalMedicalData = await getPatientMedicalDataUsingPatientService(referral.patient, receivingHospitalName);
    }

    if (!externalMedicalData) {
      throw new AppError(404, `Patient with national ID ${nationalId} not found in ${receivingHospitalName} database`);
    }

    const formattedMedicalData = formatMedicalData(externalMedicalData);
    const externalDemographics = formatExternalDemographics(externalMedicalData.patient);

    return {
      nationalId: externalDemographics.patient_national_id || nationalId,
      hospital: receivingHospitalName,
      ...formattedMedicalData,
    };
  }

  async getReferralsByHospital(hospitalId: string) {
    return await prisma.referral.findMany({
      where: {
        OR: [
          { requestingHospitalId: hospitalId },
          { receivingHospitalId: hospitalId },
        ],
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReferralStatus(id: string, status: string, currentUser: JwtPayload) {
    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        receivingHospital: true,
        requestingHospital: true,
      },
    });

    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }

    // Only receiving hospital can approve/reject
    if (referral.receivingHospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Only receiving hospital can update referral status');
    }

    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
      include: {
        patient: true,
        requestingHospital: true,
        receivingHospital: true,
      },
    });

    // Notify requesting hospital about status change
    await notificationService.notifyReferralStatusChange(
      referral.requestingHospitalId,
      referral.patient.name,
      status,
      referral.receivingHospital.name
    );

    return updatedReferral;
  }

  async getReferralStats(hospitalId: string) {
    const referrals = await prisma.referral.findMany({
      where: {
        OR: [
          { requestingHospitalId: hospitalId },
          { receivingHospitalId: hospitalId },
        ],
      },
    });

    return {
      total: referrals.length,
      pending: referrals.filter((r) => r.status === 'pending').length,
      approved: referrals.filter((r) => r.status === 'approved').length,
      completed: referrals.filter((r) => r.status === 'completed').length,
      rejected: referrals.filter((r) => r.status === 'rejected').length,
    };
  }
}

export const referralService = new ReferralService();
