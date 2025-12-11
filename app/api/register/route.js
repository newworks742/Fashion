import { hash } from "bcrypt";
import pool from "@/lib/db";

// ========== REGISTER USER ==========
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, phone, country } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    if (exists.rows.length) {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const insertQuery = `
      INSERT INTO users (id, email, password_hash, first_name, phone, country)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
      RETURNING id, email, first_name, phone, country
    `;
    const values = [email, passwordHash, firstName || null, phone || null, country || null];
    const r = await pool.query(insertQuery, values);

    return new Response(JSON.stringify({ success: true, user: r.rows[0] }), { status: 201 });
  } catch (err) {
    console.error("signup error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ========== UPDATE PROFILE ==========
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { userId, name, phone } = body;

    const q = `
      UPDATE users 
      SET first_name = $1, phone = $2
      WHERE id = $3
      RETURNING id, email, first_name, phone
    `;
    const r = await pool.query(q, [name, phone, userId]);

    return new Response(JSON.stringify({ success: true, user: r.rows[0] }));
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ========== ADD / EDIT / DELETE / DEFAULT ADDRESS ==========
export async function PUT(req) {
  try {
    const body = await req.json();
    const { action } = body;

    // -------- ADD ADDRESS --------
    if (action === "add") {
      const { userId, type, street, city, state, zip, country, isDefault } = body;

      if (isDefault) {
        await pool.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
      }

      const q = `
        INSERT INTO addresses (id, user_id, type, street, city, state, zip, country, is_default)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const r = await pool.query(q, [userId, type, street, city, state, zip, country, isDefault]);
      return new Response(JSON.stringify(r.rows[0]));
    }

    // -------- EDIT ADDRESS --------
    if (action === "edit") {
      const { addressId, type, street, city, state, zip, country, isDefault, userId } = body;

      if (isDefault) {
        await pool.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
      }

      const q = `
        UPDATE addresses 
        SET type=$1, street=$2, city=$3, state=$4, zip=$5, country=$6, is_default=$7
        WHERE id=$8
        RETURNING *
      `;
      const r = await pool.query(q, [type, street, city, state, zip, country, isDefault, addressId]);
      return new Response(JSON.stringify(r.rows[0]));
    }

    // -------- DELETE ADDRESS --------
    if (action === "delete") {
      const { addressId } = body;
      await pool.query("DELETE FROM addresses WHERE id=$1", [addressId]);
      return new Response(JSON.stringify({ success: true }));
    }

    // -------- SET DEFAULT ADDRESS --------
    if (action === "default") {
      const { userId, addressId } = body;
      await pool.query("UPDATE addresses SET is_default=false WHERE user_id=$1", [userId]);
      await pool.query("UPDATE addresses SET is_default=true WHERE id=$1", [addressId]);
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (err) {
    console.error("ADDRESS ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ========== GET PROFILE / ADDRESSES / ORDERS ==========
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    // -------- GET PROFILE --------
    if (type === 'profile') {
      const r = await pool.query(
        "SELECT id, email, first_name, phone FROM users WHERE id=$1",
        [userId]
      );
      return new Response(JSON.stringify(r.rows[0] || {}));
    }

    // -------- GET ADDRESSES --------
    if (type === "addresses") {
      const r = await pool.query(
        "SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC",
        [userId]
      );
      return new Response(JSON.stringify(r.rows));
    }

    // -------- GET ORDERS --------
    if (type === "orders") {
      const r = await pool.query(
        "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
        [userId]
      );
      return new Response(JSON.stringify(r.rows));
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  } catch (err) {
    console.error("GET ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
