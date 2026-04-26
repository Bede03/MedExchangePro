const oracledb = require('oracledb');

const pool = {
  user: 'system',
  password: 'bede',
  connectString: 'localhost:1521/xe',
};

async function testOracle() {
  let connection;
  try {
    const connectionPool = await oracledb.createPool(pool);
    connection = await connectionPool.getConnection();
    console.log('Connected to Oracle');

    // Test encounters with CLOB handling
    const encounterResult = await connection.execute(
      `SELECT e.encounter_id, e.visit_id, e.staff_id, e.encounter_time, e.type, e.notes, e.is_paperless
       FROM encounters e
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId
       ORDER BY e.encounter_time DESC`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { "NOTES": { type: oracledb.STRING } } }
    );
    console.log('Encounters result:', encounterResult.rows);

    // Test diagnoses with CLOB handling
    const diagnosisResult = await connection.execute(
      `SELECT d.diag_id, d.encounter_id, d.icd10_code, d.description, d.is_primary, d.confirmed_at
       FROM diagnoses d
       JOIN encounters e ON d.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId
       ORDER BY d.confirmed_at DESC`,
      { patientId: 1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { "DESCRIPTION": { type: oracledb.STRING } } }
    );
    console.log('Diagnoses result:', diagnosisResult.rows);

    // Test lab results
    const labResult = await connection.execute(
      `SELECT lr.result_id, lr.order_id, lr.parameter, lr.value, lr.unit, lr.ref_range, lr.flag, lr.resulted_at
       FROM lab_results lr
       JOIN lab_orders lo ON lr.order_id = lo.order_id
       JOIN encounters e ON lo.encounter_id = e.encounter_id
       JOIN visits v ON e.visit_id = v.visit_id
       WHERE v.patient_id = :patientId
       ORDER BY lr.resulted_at DESC`,
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