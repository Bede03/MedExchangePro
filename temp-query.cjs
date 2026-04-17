const mysql = require('./backend/node_modules/mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'bede',
    database: 'chuk_demo',
  });
  try {
    const [rows] = await conn.query(
      `SELECT p.patient_id, p.first_name, p.last_name, p.dob, p.gender, p.national_id, p.phone, p.blood_type, p.insurance_id, CONCAT_WS(', ', a.cell, a.sector, a.district, a.province) AS address FROM patients p LEFT JOIN addresses a ON p.address_id = a.address_id WHERE p.patient_id = ?`,
      [2]
    );
    console.log('FIRST', JSON.stringify(rows));
    const [enc] = await conn.query(
      `SELECT e.encounter_id, e.visit_id, e.staff_id, e.encounter_time, e.notes, e.type FROM encounters e JOIN visits v ON e.visit_id = v.visit_id WHERE v.patient_id = ? ORDER BY e.encounter_time DESC`,
      [2]
    );
    console.log('ENCOUNTERS', JSON.stringify(enc));
    const [diag] = await conn.query(
      `SELECT d.diag_id, d.encounter_id, d.icd10_code, d.description, d.is_primary, d.confirmed_at FROM diagnoses d JOIN encounters e ON d.encounter_id = e.encounter_id JOIN visits v ON e.visit_id = v.visit_id WHERE v.patient_id = ? ORDER BY d.confirmed_at DESC`,
      [2]
    );
    console.log('DIAG', JSON.stringify(diag));
  } catch (e) {
    console.error(e.message);
    console.error(e.stack);
  } finally {
    await conn.end();
  }
})();
