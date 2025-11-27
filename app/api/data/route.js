// app/api/data/route.js
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM your_table_name'); 
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}
