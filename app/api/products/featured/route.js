import pool from '@/lib/db';

export async function GET() {
  try {
    // Fetch Men products with discount >= 40%
    const query = `
      SELECT * 
      FROM product
      WHERE category = 'Men'  AND CAST(REPLACE(discount, '%', '') AS INT) >= 40
      ORDER BY id DESC
      LIMIT 4
    `;
    const result = await pool.query(query);

    return new Response(
      JSON.stringify({ products: result.rows || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Featured fetch error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed fetching featured', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
