import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT id, product_name, product_url, image_url, subcategory, type, discount
      FROM product
      WHERE discount > 40
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const result = await pool.query(query);

    return new Response(
      JSON.stringify({ products: result.rows }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
