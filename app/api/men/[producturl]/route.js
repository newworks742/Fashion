// app/api/men/[producturl]/route.js
import pool from '@/lib/db';

export async function GET(request, context) {
  try {
    // Next.js 13+ App Router uses context.params
    const params = await context.params;
    const { producturl } = params;

    console.log('Received params:', params);
    console.log('producturl:', producturl);

    if (!producturl) {
      return new Response(
        JSON.stringify({
          error: 'Product URL is required',
          receivedParams: params
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Query to fetch product by producturl
    const query = `
      SELECT * 
      FROM product 
      WHERE producturl = $1 AND category = 'Men'
      LIMIT 1
    `;
    
    const result = await pool.query(query, [producturl]);

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Product not found'
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        product: result.rows[0]
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (err) {
    console.error('Product fetch error:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch product',
        detail: err.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}