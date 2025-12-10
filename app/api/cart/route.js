// import pool from '../../../lib/db';

// export async function POST(request) {
//   try {
//     const body = await request.json();
    
//     if (!body || !Array.isArray(body.items) || body.items.length === 0) {
//       return Response.json({ error: 'Invalid payload. Expect { items: [ ... ] }' }, { status: 400 });
//     }

//     const items = body.items.map((it) => ({
//       userid : it.userid ?? null,
//       product_id: it.product_id ?? null,
//       name: (it.name ?? '').toString().trim(),
//       price: typeof it.price === 'number' ? it.price : parseFloat(it.price) || 0,
//       category: it.category ?? null,
//       size: it.size ?? null,
//       color: it.color ?? null,
//       qty: isFinite(it.qty) ? Number(it.qty) : 1
    
//     }));

//     // Validate basic fields
//     for (const it of items) {
//       if (!it.name) return Response.json({ error: 'Each item must include a name' }, { status: 400 });
//       if (isNaN(it.price)) return Response.json({ error: 'Invalid price' }, { status: 400 });
//     }

//     const client = await pool.connect();

//     try {
//       await client.query("BEGIN");

//       const cols = ["userid","product_id", "name", "price", "category", "size", "color", "qty"];

//       const values = [];
//       const placeholders = items
//         .map((it, i) => {
//           const start = i * cols.length + 1;

//           values.push(
//             it.userid,
//             it.product_id,
//             it.name,
//             it.price,
//             it.category,
//             it.size,
//             it.color,
//             it.qty
//           );

//           return `(${cols.map((_, j) => `$${start + j}`).join(", ")})`;
//         })
//         .join(", ");

//       const sql = `
//         INSERT INTO cart (${cols.join(", ")})
//         VALUES ${placeholders}
//         RETURNING userid , id, product_id, name, price, qty
//       `;

//       const result = await client.query(sql, values);

//       await client.query("COMMIT");

//       return Response.json(
//         {
//           inserted: result.rowCount,
//           items: result.rows,
//         },
//         { status: 201 }
//       );

//     } catch (err) {
//       await client.query("ROLLBACK");
//       console.error("DB insert error:", err);
//       return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
//     } finally {
//       client.release();
//     }

//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
//   }
// }
import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: 'Invalid payload. Expect { items: [ ... ] }' }, { status: 400 });
    }

    const items = body.items.map((it) => ({
      userid: it.userid ?? null,
      product_id: it.product_id ?? null,
      name: (it.name ?? '').toString().trim(),
      price: typeof it.price === 'number' ? it.price : parseFloat(it.price) || 0,
      category: it.category ?? null,
      size: it.size ?? null,
      color: it.color ?? null,
      qty: isFinite(it.qty) ? Number(it.qty) : 1
    }));

    // Validate basic fields
    for (const it of items) {
      if (!it.name) return Response.json({ error: 'Each item must include a name' }, { status: 400 });
      if (isNaN(it.price)) return Response.json({ error: 'Invalid price' }, { status: 400 });
      if (!it.userid) return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const results = [];
      let totalInserted = 0;
      let totalUpdated = 0;

      for (const item of items) {
        // Check if item with same userid, product_id, size, and color exists
        const checkSql = `
          SELECT id, qty 
          FROM cart 
          WHERE userid = $1 
            AND product_id = $2 
            AND (size = $3 OR (size IS NULL AND $3 IS NULL))
            AND (color = $4 OR (color IS NULL AND $4 IS NULL))
          LIMIT 1
        `;
        
        const existingItem = await client.query(checkSql, [
          item.userid,
          item.product_id,
          item.size,
          item.color
        ]);

        if (existingItem.rows.length > 0) {
          // Item exists - update quantity
          const currentQty = existingItem.rows[0].qty || 0;
          const newQty = currentQty + item.qty;
          
          const updateSql = `
            UPDATE cart 
            SET qty = $1, 
                price = $2,
                name = $3,
                category = $4
            WHERE id = $5
            RETURNING id, userid, product_id, name, price, category, size, color, qty
          `;
          
          const updateResult = await client.query(updateSql, [
            newQty,
            item.price,
            item.name,
            item.category,
            existingItem.rows[0].id
          ]);
          
          results.push({
            ...updateResult.rows[0],
            updated: true
          });
          totalUpdated++;
          
        } else {
          // Item doesn't exist - insert new row
          const insertSql = `
            INSERT INTO cart (userid, product_id, name, price, category, size, color, qty)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, userid, product_id, name, price, category, size, color, qty
          `;
          
          const insertResult = await client.query(insertSql, [
            item.userid,
            item.product_id,
            item.name,
            item.price,
            item.category,
            item.size,
            item.color,
            item.qty
          ]);
          
          results.push({
            ...insertResult.rows[0],
            updated: false
          });
          totalInserted++;
        }
      }

      await client.query("COMMIT");

      return Response.json(
        {
          success: true,
          inserted: totalInserted,
          updated: totalUpdated,
          items: results,
          message: totalUpdated > 0 ? 'Cart quantity updated' : 'Item added to cart'
        },
        { status: 200 }
      );

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB operation error:", err);
      return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
  }
}