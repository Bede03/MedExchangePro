import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospitalDepartment.deleteMany();
  await prisma.hospital.deleteMany();

  // Create hospitals
  const hospital1 = await prisma.hospital.create({
    data: {
      name: 'CHUK',
      location: 'KN 05 St, Kigali',
    },
  });

  const hospital2 = await prisma.hospital.create({
    data: {
      name: 'King Faisal Hospital',
      location: 'KK 03 St, Kigali',
    },
  });

  console.log('✅ Hospitals created');

  // Create hospital departments
  const departments = ['Cardiology', 'Surgery', 'Pediatrics', 'Orthopedics', 'Radiology', 'ICU', 'Neurology'];
  
  for (const dept of departments) {
    await prisma.hospitalDepartment.create({
      data: {
        hospitalId: hospital1.id,
        departmentName: dept,
        category: dept,
      },
    });
    
    await prisma.hospitalDepartment.create({
      data: {
        hospitalId: hospital2.id,
        departmentName: dept,
        category: dept,
      },
    });
  }

  console.log('✅ Hospital departments created');

  // Create users
  const user1 = await prisma.user.create({
    data: {
      fullName: 'Jean Claude',
      email: 'jean@kfh.rw',
      password: await hashPassword('password123'),
      role: 'admin',
      hospitalId: hospital2.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Izere Mpuhwe',
      email: 'izere@chuk.rw',
      password: await hashPassword('password123'),
      role: 'clinician',
      hospitalId: hospital1.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      fullName: 'Aline Uwase',
      email: 'aline@chuk.rw',
      password: await hashPassword('password123'),
      role: 'hospital_staff',
      hospitalId: hospital1.id,
    },
  });

  console.log('✅ Users created');

  // Create patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Emmanuel Niyonzima',
      gender: 'male',
      dob: '1989-06-15',
      phone: '0781234567',
      address: 'KN 5 Rd, Kacyiru, Kigali',
      nationalId: '1200987654321001',
      hospitalId: hospital1.id,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Aline Uwase',
      gender: 'female',
      dob: '1997-04-08',
      phone: '0782345678',
      address: 'KN 5 Rd, Kacyiru, Kigali',
      nationalId: '1200123456789002',
      hospitalId: hospital1.id,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Jean Pierre',
      gender: 'male',
      dob: '1972-11-21',
      phone: '0783456789',
      address: 'KN 3 Rd, Kigali',
      nationalId: '1200456789012003',
      hospitalId: hospital2.id,
    },
  });

  console.log('✅ Patients created');

  // Create referrals
  const now = new Date();

  await prisma.referral.create({
    data: {
      referralNumber: 1,
      patientId: patient1.id,
      reason: 'Heart attack',
      priority: 'Emergency',
      department: 'Cardiology',
      status: 'completed',
      requestingHospitalId: hospital1.id,
      receivingHospitalId: hospital2.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 9),
      completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
    },
  });

  await prisma.referral.create({
    data: {
      referralNumber: 2,
      patientId: patient2.id,
      reason: 'Post-surgical complication',
      priority: 'Urgent',
      department: 'Surgery',
      status: 'completed',
      requestingHospitalId: hospital1.id,
      receivingHospitalId: hospital2.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 11),
      completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
    },
  });

  await prisma.referral.create({
    data: {
      referralNumber: 3,
      patientId: patient2.id,
      reason: 'ICU monitoring',
      priority: 'Emergency',
      department: 'ICU',
      status: 'pending',
      requestingHospitalId: hospital1.id,
      receivingHospitalId: hospital2.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  // Add referrals FROM King Faisal Hospital TO CHUK (so CHUK can see incoming referrals)
  await prisma.referral.create({
    data: {
      referralNumber: 4,
      patientId: patient3.id,
      reason: 'chest imaging report',
      priority: 'Urgent',
      department: 'Radiology',
      status: 'pending',
      requestingHospitalId: hospital2.id,
      receivingHospitalId: hospital1.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  await prisma.referral.create({
    data: {
      referralNumber: 5,
      patientId: patient3.id,
      reason: 'Orthopedic consultation',
      priority: 'Routine',
      department: 'Orthopedics',
      status: 'approved',
      requestingHospitalId: hospital2.id,
      receivingHospitalId: hospital1.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  await prisma.referral.create({
    data: {
      referralNumber: 6,
      patientId: patient3.id,
      reason: 'Neurology consultation',
      priority: 'Urgent',
      department: 'Neurology',
      status: 'pending',
      requestingHospitalId: hospital2.id,
      receivingHospitalId: hospital1.id,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 60 * 1),
    },
  });

  console.log('✅ Referrals created');

  console.log('✅ Referrals created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
