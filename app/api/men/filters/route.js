import pool from '@/lib/db';

export async function GET() {
  try {
    // Get unique subcategories
    const subcategoryQuery = `
      SELECT DISTINCT subcategory 
      FROM product 
      WHERE category = 'Men' AND subcategory IS NOT NULL
      ORDER BY subcategory
    `;
    const subcategoryResult = await pool.query(subcategoryQuery);
    const subcategories = subcategoryResult.rows.map(row => row.subcategory);

    // Get unique types
    const typeQuery = `
      SELECT DISTINCT type 
      FROM product 
      WHERE category = 'Men' AND type IS NOT NULL
      ORDER BY type
    `;
    const typeResult = await pool.query(typeQuery);
    const types = typeResult.rows.map(row => row.type);

    // Get unique colors (split comma-separated values)
    const colorQuery = `
      SELECT DISTINCT TRIM(unnest(string_to_array(colors, ','))) as color
      FROM product 
      WHERE category = 'Men' AND colors IS NOT NULL AND colors != ''
      ORDER BY color
    `;
    const colorResult = await pool.query(colorQuery);
    const colors = colorResult.rows.map(row => row.color).filter(Boolean);

    // Get unique sizes (split comma-separated values)
    const sizeQuery = `
      SELECT DISTINCT TRIM(unnest(string_to_array(sizes, ','))) as size
      FROM product 
      WHERE category = 'Men' AND sizes IS NOT NULL AND sizes != ''
      ORDER BY size
    `;
    const sizeResult = await pool.query(sizeQuery);
    const sizes = sizeResult.rows.map(row => row.size).filter(Boolean);

    return new Response(
      JSON.stringify({
        subcategory: subcategories,
        types: types,
        colors: colors,
        sizes: sizes
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (err) {
    console.error('Filter fetch error:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch filters',
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
