require('dotenv').config();
const mysql = require('mysql2/promise');

// Database Connection Pool configuration from .env
const pool = mysql.createPool({
  host: process.env.DB_HOST || '119.59.102.161',
  user: process.env.DB_USER || 'std6730202653',
  password: process.env.DB_PASSWORD || 'Lz#5pKqV',
  database: process.env.DB_NAME || 'it_std6730202653',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection function
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully:', process.env.DB_NAME);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testDbConnection
};
