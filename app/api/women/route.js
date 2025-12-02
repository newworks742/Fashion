
// import pool from '@/lib/db';

// export async function GET(request) {
//   try {
//     // Get pagination parameters from URL
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 12;
//     const offset = (page - 1) * limit;

//     // Get total count
//     const countResult = await pool.query(
//       `SELECT COUNT(*) FROM product WHERE category = 'Men'`
//     );
//     const total = parseInt(countResult.rows[0].count);

//     // Get paginated data
//     const result = await pool.query(
//       `SELECT * FROM product 
//        WHERE category = 'Men' 
//        ORDER BY id 
//        LIMIT $1 OFFSET $2`,
//       [limit, offset]
//     );

//     return new Response(
//       JSON.stringify({
//         data: result.rows || [],
//         total: total,
//         page: page,
//         limit: limit,
//         totalPages: Math.ceil(total / limit)
//       }),
//       { 
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   } catch (err) {
//     console.error('DB query error:', err);
//     return new Response(
//       JSON.stringify({
//         error: 'Database error',
//         detail: err.message || 'Unknown error'
//       }),
//       { 
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   }
// }


// import pool from '@/lib/db';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 12;
//     const offset = (page - 1) * limit;

//     // Get filter parameters
//     const subcategories = searchParams.get('subcategory')?.split(',').filter(Boolean) || [];
//     const types = searchParams.get('type')?.split(',').filter(Boolean) || [];
//     const minPrice = searchParams.get('minPrice');
//     const maxPrice = searchParams.get('maxPrice');
//     const minRating = searchParams.get('minRating');
//     const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
//     const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
//     const sortBy = searchParams.get('sortBy') || '';

//     // Build WHERE clause
//     let whereConditions = ["category = 'Men'"];
//     let queryParams = [];
//     let paramIndex = 1;

//     if (subcategories.length > 0) {
//       whereConditions.push(`subcategory = ANY($${paramIndex})`);
//       queryParams.push(subcategories);
//       paramIndex++;
//     }

//     if (types.length > 0) {
//       whereConditions.push(`type = ANY($${paramIndex})`);
//       queryParams.push(types);
//       paramIndex++;
//     }

//     if (minPrice) {
//       whereConditions.push(`CAST(REPLACE(discounted_price, ',', '') AS NUMERIC) >= $${paramIndex}`);
//       queryParams.push(parseFloat(minPrice));
//       paramIndex++;
//     }

//     if (maxPrice) {
//       whereConditions.push(`CAST(REPLACE(discounted_price, ',', '') AS NUMERIC) <= $${paramIndex}`);
//       queryParams.push(parseFloat(maxPrice));
//       paramIndex++;
//     }

//     if (minRating) {
//       whereConditions.push(`CAST(rating AS NUMERIC) >= $${paramIndex}`);
//       queryParams.push(parseFloat(minRating));
//       paramIndex++;
//     }

//     if (colors.length > 0) {
//       const colorConditions = colors.map((color, idx) => {
//         queryParams.push(`%${color}%`);
//         return `colors ILIKE $${paramIndex + idx}`;
//       });
//       whereConditions.push(`(${colorConditions.join(' OR ')})`);
//       paramIndex += colors.length;
//     }

//     if (sizes.length > 0) {
//       const sizeConditions = sizes.map((size, idx) => {
//         queryParams.push(`%${size}%`);
//         return `sizes ILIKE $${paramIndex + idx}`;
//       });
//       whereConditions.push(`(${sizeConditions.join(' OR ')})`);
//       paramIndex += sizes.length;
//     }

//     const whereClause = whereConditions.join(' AND ');

//     // Build ORDER BY clause
//     let orderByClause = 'ORDER BY id';
    
//     switch(sortBy) {
//       case 'price_low':
//         orderByClause = 'ORDER BY CAST(REPLACE(discounted_price, \',\', \'\') AS NUMERIC) ASC';
//         break;
//       case 'price_high':
//         orderByClause = 'ORDER BY CAST(REPLACE(discounted_price, \',\', \'\') AS NUMERIC) DESC';
//         break;
//       case 'rating_high':
//         orderByClause = 'ORDER BY CAST(rating AS NUMERIC) DESC';
//         break;
//       case 'rating_low':
//         orderByClause = 'ORDER BY CAST(rating AS NUMERIC) ASC';
//         break;
//       case 'discount_high':
//         orderByClause = 'ORDER BY CAST(REPLACE(REPLACE(discount, \'%\', \'\'), \'off\', \'\') AS NUMERIC) DESC';
//         break;
//       default:
//         orderByClause = 'ORDER BY id';
//     }

//     // Get total count with filters
//     const countQuery = `SELECT COUNT(*) FROM product WHERE ${whereClause}`;
//     const countResult = await pool.query(countQuery, queryParams);
//     const total = parseInt(countResult.rows[0].count);

//     // Get paginated data with filters and sorting
//     const dataQuery = `
//       SELECT * FROM product 
//       WHERE ${whereClause}
//       ${orderByClause}
//       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//     `;
//     const dataParams = [...queryParams, limit, offset];
//     const result = await pool.query(dataQuery, dataParams);

//     return new Response(
//       JSON.stringify({
//         data: result.rows || [],
//         total: total,
//         page: page,
//         limit: limit,
//         totalPages: Math.ceil(total / limit)
//       }),
//       { 
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   } catch (err) {
//     console.error('DB query error:', err);
//     return new Response(
//       JSON.stringify({
//         error: 'Database error',
//         detail: err.message || 'Unknown error'
//       }),
//       { 
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//   }
// }



import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Get filter parameters
    const subcategories = searchParams.get('subcategory')?.split(',').filter(Boolean) || [];
    const types = searchParams.get('type')?.split(',').filter(Boolean) || [];
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || '';

    // Build WHERE clause
    let whereConditions = ["category = 'Women'"];
    let queryParams = [];
    let paramIndex = 1;

    if (subcategories.length > 0) {
      whereConditions.push(`subcategory = ANY($${paramIndex})`);
      queryParams.push(subcategories);
      paramIndex++;
    }

    if (types.length > 0) {
      whereConditions.push(`type = ANY($${paramIndex})`);
      queryParams.push(types);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`discounted_price >= $${paramIndex}`);
      queryParams.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`discounted_price <= $${paramIndex}`);
      queryParams.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (minRating) {
      whereConditions.push(`rating >= $${paramIndex}`);
      queryParams.push(parseFloat(minRating));
      paramIndex++;
    }

    if (colors.length > 0) {
      const colorConditions = colors.map((color, idx) => {
        queryParams.push(`%${color}%`);
        return `colors ILIKE $${paramIndex + idx}`;
      });
      whereConditions.push(`(${colorConditions.join(' OR ')})`);
      paramIndex += colors.length;
    }

    if (sizes.length > 0) {
      const sizeConditions = sizes.map((size, idx) => {
        queryParams.push(`%${size}%`);
        return `sizes ILIKE $${paramIndex + idx}`;
      });
      whereConditions.push(`(${sizeConditions.join(' OR ')})`);
      paramIndex += sizes.length;
    }

    const whereClause = whereConditions.join(' AND ');

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY id';
    
    switch(sortBy) {
      case 'price_low':
        orderByClause = 'ORDER BY discounted_price ASC';
        break;
      case 'price_high':
        orderByClause = 'ORDER BY discounted_price DESC';
        break;
      case 'rating_high':
        orderByClause = 'ORDER BY rating DESC';
        break;
      case 'rating_low':
        orderByClause = 'ORDER BY rating ASC';
        break;
      case 'discount_high':
        // If discount is stored as text like "20%", extract the number
        orderByClause = `ORDER BY CAST(REPLACE(discount, '%', '') AS NUMERIC) DESC NULLS LAST`;
        break;
      default:
        orderByClause = 'ORDER BY id';
    }

    // Get total count with filters
    const countQuery = `SELECT COUNT(*) FROM product WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data with filters and sorting
    const dataQuery = `
      SELECT * FROM product 
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataParams = [...queryParams, limit, offset];
    const result = await pool.query(dataQuery, dataParams);

    return new Response(
      JSON.stringify({
        data: result.rows || [],
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (err) {
    console.error('DB query error:', err);
    return new Response(
      JSON.stringify({
        error: 'Database error',
        detail: err.message || 'Unknown error'
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