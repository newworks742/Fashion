
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM product WHERE category = 'Men'`);
    return new Response(JSON.stringify(result.rows || []), { status: 200 });
  } catch (err) {
    console.error('DB query error:', err);
    return new Response(
      JSON.stringify({
        error: 'Database error',
        detail: err.message || 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
