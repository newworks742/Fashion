// pages/api/products.js
import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT * FROM products'); // replace with your table
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
}
