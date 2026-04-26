// Test script to check Oracle data - simplified
import oracledb from 'oracledb';

async function testOracleData() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'system',
      password: 'bede',
      connectString: 'localhost:1521/xe'
    });

    console.log('=== Checking Oracle Data Counts ===\n');

    // Check diagnoses
    const diagnoses = await connection.execute(
      `SELECT COUNT(*) as cnt FROM diagnoses`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Diagnoses count:', diagnoses.rows[0].CNT);

    // Check prescriptions
    const prescriptions = await connection.execute(
      `SELECT COUNT(*) as cnt FROM prescriptions`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Prescriptions count:', prescriptions.rows[0].CNT);

    // Check lab_orders
    const labOrders = await connection.execute(
      `SELECT COUNT(*) as cnt FROM lab_orders`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Lab Orders count:', labOrders.rows[0].CNT);

    // Check lab_results
    const labResults = await connection.execute(
      `SELECT COUNT(*) as cnt FROM lab_results`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Lab Results count:', labResults.rows[0].CNT);

    // Check medications
    const medications = await connection.execute(
      `SELECT COUNT(*) as cnt FROM medications`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Medications count:', medications.rows[0].CNT);

    // Now test the actual queries used in the service for patient 1
    console.log('\n=== Testing Service Queries for Patient 1 ===\n');

    // Test encounters query
    const encResult = await connection.execute(
      `SELECT COUNT(*) as cnt
       FROM encounters e
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Encounters for patient 1:', encResult.rows[0].CNT);

    // Test diagnoses query
    const diagResult = await connection.execute(
      `SELECT COUNT(*) as cnt
       FROM diagnoses d
       JOIN encounters e ON d.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Diagnoses for patient 1:', diagResult.rows[0].CNT);

    // Test prescriptions query
    const rxResult = await connection.execute(
      `SELECT COUNT(*) as cnt
       FROM prescriptions pr
       JOIN encounters e ON pr.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Prescriptions for patient 1:', rxResult.rows[0].CNT);

    // Test lab results query
    const labResult = await connection.execute(
      `SELECT COUNT(*) as cnt
       FROM lab_results lr
       JOIN lab_orders lo ON lr.order_id = lo.order_id
       JOIN encounters e ON lo.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Lab Results for patient 1:', labResult.rows[0].CNT);

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

testOracleData();