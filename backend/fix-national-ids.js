const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update patients with correct national IDs from external databases
  // Based on matching names between PostgreSQL and KFH Oracle
  
  const updates = [
    { name: 'Emmanuel Niyonzima', correctNationalId: '1197582153456789' }, // KFH patient 3
    { name: 'Aline Uwase', correctNationalId: '1199708232345678' },        // KFH patient 2
    { name: 'Jean Pierre', correctNationalId: '1198805121234567' },        // KFH patient 1
  ];

  for (const update of updates) {
    const patient = await prisma.patient.findFirst({
      where: { name: update.name }
    });
    
    if (patient) {
      console.log(`Updating ${patient.name}: ${patient.nationalId} -> ${update.correctNationalId}`);
      await prisma.patient.update({
        where: { id: patient.id },
        data: { nationalId: update.correctNationalId }
      });
    } else {
      console.log(`Patient not found: ${update.name}`);
    }
  }

  // Verify the updates
  const patients = await prisma.patient.findMany({
    select: { id: true, name: true, nationalId: true }
  });
  console.log('\nUpdated patients:');
  console.log(JSON.stringify(patients, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());