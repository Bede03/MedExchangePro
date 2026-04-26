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

    // Check lab_orders table structure
    const labOrdersResult = await connection.execute(
      `SELECT column_name FROM user_tab_columns WHERE table_name = 'LAB_ORDERS'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('LAB_ORDERS columns:', labOrdersResult.rows);

    // Check lab_results table structure
    const labResultsResult = await connection.execute(
      `SELECT column_name FROM user_tab_columns WHERE table_name = 'LAB_RESULTS'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('LAB_RESULTS columns:', labResultsResult.rows);

    // Check if there's a patient_id in lab_orders
    const labOrdersData = await connection.execute(
      `SELECT * FROM lab_orders WHERE ROWNUM <= 1`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('LAB_ORDERS sample:', labOrdersData.rows);

    // Check lab_results data
    const labResultsData = await connection.execute(
      `SELECT * FROM lab_results WHERE ROWNUM <= 1`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('LAB_RESULTS sample:', labResultsData.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

testOracle();