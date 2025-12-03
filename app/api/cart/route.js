import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: 'Invalid payload. Expect { items: [ ... ] }' }, { status: 400 });
    }

    const items = body.items.map((it) => ({
      userid : it.userid ?? null,
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
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const cols = ["userid","product_id", "name", "price", "category", "size", "color", "qty"];

      const values = [];
      const placeholders = items
        .map((it, i) => {
          const start = i * cols.length + 1;

          values.push(
            it.userid,
            it.product_id,
            it.name,
            it.price,
            it.category,
            it.size,
            it.color,
            it.qty
          );

          return `(${cols.map((_, j) => `$${start + j}`).join(", ")})`;
        })
        .join(", ");

      const sql = `
        INSERT INTO cart (${cols.join(", ")})
        VALUES ${placeholders}
        RETURNING userid , id, product_id, name, price, qty
      `;

      const result = await client.query(sql, values);

      await client.query("COMMIT");

      return Response.json(
        {
          inserted: result.rowCount,
          items: result.rows,
        },
        { status: 201 }
      );

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB insert error:", err);
      return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
  }
}
