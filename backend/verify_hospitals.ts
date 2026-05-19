import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospital.findMany({
    select: { id: true, name: true }
  });
  
  console.log("Hospitals in database:");
  hospitals.forEach(h => console.log(`  - ${h.id}: ${h.name}`));
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
