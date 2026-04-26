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
async function getPatientMedicalDataFromExternalDB(nationalId: string, hospitalName: string) {
  const hospitalLower = hospitalName.toLowerCase();
  
  // Check if it's KFH (King Faisal Hospital) - use Oracle
  if (hospitalLower.includes('king faisal') || hospitalLower.includes('kfh')) {
    try {
      console.log('[DEBUG] Fetching patient data from KFH Oracle for nationalId:', nationalId);
      const kfhPatient = await kfhOracleService.getPatientByNationalId(nationalId);
      
      if (kfhPatient) {
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
      const chukPatients = await externalMysqlService.getPatientRecordsByNationalId(nationalId);
      
      if (chukPatients && chukPatients.length > 0) {
        return {
          source: 'CHUK MySQL',
          patient: chukPatients[0]
        };
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching from CHUK MySQL:', error);
    }
  }
  
  return null;
}

// Format medical data for response
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
      `${p.GENERIC_NAME || p.MED_ID || 'Medication'} - ${p.DOSE} ${p.FREQUENCY} for ${p.DURATION_DAYS} days`
    ).join('; ');
  }
  
  // Format lab results
  let labResultsStr = '';
  if (labResults && labResults.length > 0) {
    labResultsStr = labResults.slice(0, 10).map((lr: any) => 
      `${lr.PARAMETER}: ${lr.VALUE} ${lr.UNIT || ''} (${lr.REF_RANGE || 'N/A'})`
    ).join('; ');
  }
  
  // Format encounters as medical history
  let medicalHistory = '';
  if (encounters && encounters.length > 0) {
    medicalHistory = encounters.slice(0, 5).map((e: any) => 
      `${e.TYPE} - ${new Date(e.ENCOUNTER_TIME).toLocaleDateString()}`
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

export class ReferralService {
  async createReferral(data: any, currentUser: JwtPayload) {
    // Verify patient exists locally or resolve a CHUK patient ID into a local record
    let patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      const chukHospitalId = await patientService.findChukHospitalId();
      if (currentUser.hospitalId !== chukHospitalId && currentUser.role !== 'admin') {
        throw new AppError(404, 'Patient not found');
      }

      patient = await patientService.getOrCreateLocalPatientFromIdentifier(
        data.patientId,
        currentUser.hospitalId
      );
    }

    if (patient.hospitalId !== currentUser.hospitalId && currentUser.role !== 'admin') {
      throw new AppError(403, 'Can only refer patients from your hospital');
    }

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
      requestingHospitalName
    );

    // If not found, try receiving hospital
    if (!externalMedicalData) {
      externalMedicalData = await getPatientMedicalDataFromExternalDB(
        nationalId,
        receivingHospitalName
      );
    }

    // Format and attach medical data to referral response
    const formattedMedicalData = formatMedicalData(externalMedicalData);

    // Return referral with additional medical data
    return {
      ...referral,
      patient: {
        ...referral.patient,
        // Add patient demographics from local record
        patient_name: referral.patient.name,
        patient_dob: referral.patient.dob,
        patient_gender: referral.patient.gender,
        patient_phone: referral.patient.phone,
        patient_national_id: referral.patient.nationalId,
        patient_address: referral.patient.address,
        // Add medical data from external database
        ...formattedMedicalData
      },
      _external_source: formattedMedicalData._external_source
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
