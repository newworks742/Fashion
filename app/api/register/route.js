import { hash } from "bcrypt";
import pool from "@/lib/db";

// ================= REGISTER USER =================
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, phone, country } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400 }
      );
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (exists.rows.length) {
      return new Response(
        JSON.stringify({ error: "Email already exists" }),
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const r = await pool.query(
      `
      INSERT INTO users (email, password_hash, first_name, phone, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, phone, country
      `,
      [email, passwordHash, firstName || null, phone || null, country || null]
    );

    return new Response(
      JSON.stringify({ success: true, user: r.rows[0] }),
      { status: 201 }
    );
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ================= UPDATE PROFILE =================
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { userId, name, phone } = body;

    const r = await pool.query(
      `
      UPDATE users
      SET first_name = $1, phone = $2
      WHERE id = $3::integer
      RETURNING id, email, first_name, phone
      `,
      [name || null, phone || null, userId]
    );

    return new Response(
      JSON.stringify({ success: true, user: r.rows[0] })
    );
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ================= ADD / EDIT / DELETE / DEFAULT ADDRESS =================
export async function PUT(req) {
  try {
    const body = await req.json();
    const { action } = body;

    // -------- ADD ADDRESS --------
    if (action === "add") {
      const {
        userId,
        type,
        fullName,
        mobile,
        flatNo,
        area,
        landmark,
        pincode,
        city,
        state,
        country,
        isDefault
      } = body;

      if (!userId || !fullName || !mobile || !flatNo || !area || !pincode || !city || !state) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400 }
        );
      }

      if (isDefault) {
        await pool.query(
          "UPDATE addresses SET is_default = false WHERE user_id = $1::integer",
          [userId]
        );
      }

      const r = await pool.query(
        `
        INSERT INTO addresses
        (user_id, type, full_name, mobile, flat_no, area, landmark, pincode, city, state, country, is_default)
        VALUES ($1::integer, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
        `,
        [
          userId,
          type,
          fullName,
          mobile,
          flatNo,
          area,
          landmark || "",
          pincode,
          city,
          state,
          country || "India",
          isDefault || false
        ]
      );

      return new Response(JSON.stringify({ success: true, address: r.rows[0] }));
    }

    // -------- EDIT ADDRESS --------
    if (action === "edit") {
      const {
        addressId,
        userId,
        type,
        fullName,
        mobile,
        flatNo,
        area,
        landmark,
        pincode,
        city,
        state,
        country,
        isDefault
      } = body;

      if (!addressId || !userId) {
        return new Response(
          JSON.stringify({ error: "Invalid request" }),
          { status: 400 }
        );
      }

      if (isDefault) {
        await pool.query(
          `
          UPDATE addresses
          SET is_default = false
          WHERE user_id = $1::integer AND id != $2::integer
          `,
          [userId, addressId]
        );
      }

      const r = await pool.query(
        `
        UPDATE addresses SET
          type = $1,
          full_name = $2,
          mobile = $3,
          flat_no = $4,
          area = $5,
          landmark = $6,
          pincode = $7,
          city = $8,
          state = $9,
          country = $10,
          is_default = $11
        WHERE id = $12::integer
        RETURNING *
        `,
        [
          type,
          fullName,
          mobile,
          flatNo,
          area,
          landmark || "",
          pincode,
          city,
          state,
          country || "India",
          isDefault || false,
          addressId
        ]
      );

      return new Response(JSON.stringify({ success: true, address: r.rows[0] }));
    }

    // -------- DELETE ADDRESS --------
    if (action === "delete") {
      const { addressId } = body;

      await pool.query(
        "DELETE FROM addresses WHERE id = $1::integer",
        [addressId]
      );

      return new Response(JSON.stringify({ success: true }));
    }

    // -------- SET DEFAULT ADDRESS --------
    if (action === "default") {
      const { userId, addressId } = body;

      await pool.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1::integer",
        [userId]
      );

      await pool.query(
        "UPDATE addresses SET is_default = true WHERE id = $1::integer",
        [addressId]
      );

      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400 }
    );
  } catch (err) {
    console.error("ADDRESS ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// ================= GET PROFILE / ADDRESSES / ORDERS =================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    // -------- GET PROFILE --------
    if (type === "profile") {
      const r = await pool.query(
        "SELECT id, email, first_name, phone FROM users WHERE id = $1::integer",
        [userId]
      );
      return new Response(JSON.stringify(r.rows[0] || {}));
    }

    // -------- GET ADDRESSES --------
    if (type === "addresses") {
      const r = await pool.query(
        "SELECT * FROM addresses WHERE user_id = $1::integer ORDER BY is_default DESC",
        [userId]
      );
      return new Response(JSON.stringify(r.rows));
    }

    // -------- GET ORDERS --------
    if (type === "orders") {
      const r = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE user_id = $1::integer
        ORDER BY created_at DESC
        `,
        [userId]
      );
      return new Response(JSON.stringify(r.rows));
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400 }
    );
  } catch (err) {
    console.error("GET ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
