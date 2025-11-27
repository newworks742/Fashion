// // app/api/data/route.js
// import pool from '@/lib/db';

// export async function GET() {
//   try {
//     const result = await pool.query('SELECT * FROM your_table_name'); 
//     return new Response(JSON.stringify(result.rows), { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
//   }
// }
import pool from '@/lib/db';

export async function GET() {
  try {
    // Replace 'users' with your actual table name
    const result = await pool.query('SELECT * FROM product LIMIT 100');

    // Ensure we always return JSON
    return new Response(JSON.stringify(result.rows || []), { status: 200 });
  } catch (err) {
    console.error('DB query error:', err);

    // Always return JSON even on error
    return new Response(
      JSON.stringify({
        error: 'Database error',
        detail: err.message || 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
