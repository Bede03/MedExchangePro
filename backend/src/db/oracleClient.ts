import oracledb from 'oracledb';

const pool = {
  user: process.env.ORACLE_USER || 'system',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 2,
};

let connectionPool: oracledb.Pool | null = null;

export async function getOracleConnection(): Promise<oracledb.Connection> {
  try {
    if (!connectionPool) {
      connectionPool = await oracledb.createPool(pool);
    }
    const connection = await connectionPool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error getting Oracle connection:', error);
    throw error;
  }
}

export async function closeOraclePool(): Promise<void> {
  if (connectionPool) {
    await connectionPool.close(10);
    connectionPool = null;
  }
}

export default { getOracleConnection, closeOraclePool };