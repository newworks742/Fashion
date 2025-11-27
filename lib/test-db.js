import pool from './lib/db.js';

async function test() {
  try {
    const res = await pool.query('SELECT NOW()'); // simple test query
    console.log('DB Connected:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  }
}

test();
