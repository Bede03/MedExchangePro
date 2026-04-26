const oracledb = require('oracledb');

const pool = {
  user: 'system',
  password: 'bede',
  connectString: 'localhost:1521/xe',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 2,
};

async function testOracle() {
  let connection;
  try {
    const connectionPool = await oracledb.createPool(pool);
    connection = await connectionPool.getConnection();
    console.log('Connected to Oracle');

    // Test patient ID 1
    const result = await connection.execute(
      `SELECT * FROM patients WHERE patient_id = :patientId`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Patient result:', result.rows);

    // Test encounters
    const encounterResult = await connection.execute(
      `SELECT e.encounter_id, e.visit_id, e.staff_id, e.encounter_time, e.type, e.notes, e.is_paperless
       FROM encounters e
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId
       ORDER BY e.encounter_time DESC`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Encounters result:', encounterResult.rows);

    // Test diagnoses
    const diagnosisResult = await connection.execute(
      `SELECT * FROM diagnoses WHERE encounter_id IN 
       (SELECT e.encounter_id FROM encounters e JOIN visits v ON e.visit_id = v.visit_id WHERE v.patient_id = :patientId)`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Diagnoses result:', diagnosisResult.rows);

    // Test prescriptions
    const prescriptionResult = await connection.execute(
      `SELECT * FROM prescriptions WHERE encounter_id IN 
       (SELECT e.encounter_id FROM encounters e JOIN visits v ON e.visit_id = v.visit_id WHERE v.patient_id = :patientId)`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Prescriptions result:', prescriptionResult.rows);

    // Test lab results
    const labResult = await connection.execute(
      `SELECT * FROM lab_results WHERE order_id IN 
       (SELECT order_id FROM lab_orders WHERE patient_id = :patientId)`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Lab results result:', labResult.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

testOracle();