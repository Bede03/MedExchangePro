const oracledb = require('oracledb');

async function testConnection() {
  try {
    console.log('🧪 Testing Oracle Database Connection\n');
    
    // Get connection config from environment
    const dbConfig = {
      user: process.env.ORACLE_USER || 'KFH',
      password: process.env.ORACLE_PASSWORD || 'KFH',
      connectionString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/xe',
    };
    
    console.log('Connection Config:');
    console.log(`  User: ${dbConfig.user}`);
    console.log(`  Connection String: ${dbConfig.connectionString}`);
    console.log(`  (Password: ${dbConfig.password ? 'set' : 'not set'})`);
    
    console.log('\nAttempting connection...');
    const connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Oracle Connection Successful!');
    
    // Test query
    console.log('\nTesting departments query...');
    const result = await connection.execute(
      `SELECT * FROM departments WHERE ROWNUM <= 5`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log(`✅ Query executed. Rows returned: ${result.rows.length}`);
    if (result.rows && result.rows.length > 0) {
      console.log('Sample department:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ No departments found in database');
    }
    
    await connection.close();
    
  } catch (error) {
    console.error('❌ Oracle Connection Failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('   → Oracle database server is not reachable');
    } else if (error.code === 'ORA-01017') {
      console.error('   → Invalid username/password');
    }
  }
}

testConnection();
