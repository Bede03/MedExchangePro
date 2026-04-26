const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospital.findMany({
    select: { id: true, name: true },
    take: 10
  });
  console.log('Hospitals:', JSON.stringify(hospitals, null, 2));
  
  const referrals = await prisma.referral.findMany({
    take: 5,
    include: {
      patient: { select: { id: true, name: true, nationalId: true } },
      requestingHospital: { select: { id: true, name: true } },
      receivingHospital: { select: { id: true, name: true } }
    }
  });
  console.log('\nReferrals:', JSON.stringify(referrals, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());