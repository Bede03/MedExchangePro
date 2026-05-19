const { PrismaClient } = require('@prisma/client');

async function checkDepartments() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking hospital departments in Prisma database\n');
    
    // Check hospital
    const hospital = await prisma.hospital.findUnique({
      where: { id: 'hosp-02' },
    });
    
    console.log('Hospital hosp-02:');
    console.log(`  Name: ${hospital.name}`);
    console.log(`  Location: ${hospital.location}`);
    
    // Check departments
    const departments = await prisma.hospitalDepartment.findMany({
      where: { hospitalId: 'hosp-02' },
    });
    
    console.log(`\nDepartments for hosp-02: ${departments.length}`);
    if (departments.length > 0) {
      console.log('Sample departments:');
      departments.slice(0, 5).forEach((dept) => {
        console.log(`  - ${dept.id}: ${dept.departmentName} (${dept.category})`);
      });
    } else {
      console.log('❌ No departments found for hosp-02!');
    }
    
    // Also check hosp-01
    console.log('\n---\n');
    const hospital1 = await prisma.hospital.findUnique({
      where: { id: 'hosp-01' },
    });
    
    console.log('Hospital hosp-01:');
    console.log(`  Name: ${hospital1.name}`);
    console.log(`  Location: ${hospital1.location}`);
    
    const departments1 = await prisma.hospitalDepartment.findMany({
      where: { hospitalId: 'hosp-01' },
    });
    
    console.log(`\nDepartments for hosp-01: ${departments1.length}`);
    if (departments1.length > 0) {
      console.log('Sample departments:');
      departments1.slice(0, 5).forEach((dept) => {
        console.log(`  - ${dept.id}: ${dept.departmentName} (${dept.category})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDepartments();
