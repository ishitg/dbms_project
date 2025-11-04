import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT current_database(), current_user, version();');
    console.table(rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
})();
