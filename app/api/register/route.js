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
    const { id, name, phone } = body;

    const q = `
      UPDATE users 
      SET first_name = $1, phone = $2
      WHERE id = $3
      RETURNING id, email, first_name, phone
    `;
    const r = await pool.query(q, [name, phone, id]);

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
      const { userId, type, fullName, mobile, flatNo, area, landmark, pincode, city, state, country, isDefault } = body;

      if (isDefault) {
        await pool.query(`UPDATE addresses SET is_default = false WHERE "userId" = $1`, [userId]);
      }

      const q = `
        INSERT INTO addresses ("userId","type","fullName","mobile","flatNo","area","landmark","pincode","city","state","country","is_default")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
      `;
      const r = await pool.query(q, [userId, type, fullName, mobile, flatNo, area, landmark, pincode, city, state, country, isDefault]);
      return new Response(JSON.stringify(r.rows[0]), { status: 201 });
    }

    // -------- EDIT ADDRESS --------
    if (action === "edit") {
      const { userId, index, ...addressForm } = body;
      const original = body.originalAddress; // pass original address fields from frontend

      if (addressForm.isDefault) {
        await pool.query(`UPDATE addresses SET is_default = false WHERE "userId" = $1`, [userId]);
      }

      const q = `
        UPDATE addresses
        SET "type"=$1,"fullName"=$2,"mobile"=$3,"flatNo"=$4,"area"=$5,"landmark"=$6,"pincode"=$7,"city"=$8,"state"=$9,"country"=$10,"is_default"=$11
        WHERE "userId"=$12 AND "type"=$13 AND "fullName"=$14 AND "flatNo"=$15 AND "area"=$16 AND "pincode"=$17
        RETURNING *
      `;
      const r = await pool.query(q, [
        addressForm.type, addressForm.fullName, addressForm.mobile, addressForm.flatNo, addressForm.area,
        addressForm.landmark, addressForm.pincode, addressForm.city, addressForm.state, addressForm.country,
        addressForm.isDefault,
        userId, original.type, original.fullName, original.flatNo, original.area, original.pincode
      ]);

      return new Response(JSON.stringify(r.rows[0]));
    }

    // -------- DELETE ADDRESS --------
    if (action === "delete") {
      const { userId, index } = body;
      const address = body.addressData; // send original fields from frontend

      await pool.query(
        `DELETE FROM addresses WHERE "userId"=$1 AND "type"=$2 AND "fullName"=$3 AND "flatNo"=$4 AND "area"=$5 AND "pincode"=$6`,
        [userId, address.type, address.fullName, address.flatNo, address.area, address.pincode]
      );

      return new Response(JSON.stringify({ success: true }));
    }

    // -------- SET DEFAULT ADDRESS --------
    if (action === "default") {
      const { userId, index } = body;
      const address = body.addressData;

      await pool.query(`UPDATE addresses SET is_default = false WHERE "userId"=$1`, [userId]);

      await pool.query(
        `UPDATE addresses SET is_default = true WHERE "userId"=$1 AND "type"=$2 AND "fullName"=$3 AND "flatNo"=$4 AND "area"=$5 AND "pincode"=$6`,
        [userId, address.type, address.fullName, address.flatNo, address.area, address.pincode]
      );

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
    const id = searchParams.get("userId");
    const userId = id;
    console.log(userId,"i am userIs");
    
     console.log(id,"idididididid")
    const type = searchParams.get("type");
     console.log(type,"thnjjzhfgkjhgfkjs")
   

    // -------- GET PROFILE --------
    if (type === 'profile') {
      const r = await pool.query(
        "SELECT id, email, first_name, phone FROM users WHERE id=$1",
        [id]
      );
      return new Response(JSON.stringify(r.rows[0] || {}));
    }

    // -------- GET ADDRESSES --------
   if (type === "addresses") {
  const r = await pool.query(
    `SELECT * FROM addresses WHERE "userId" = $1 ORDER BY "is_default" DESC`,
    [userId]
  );
  console.log("Addresses fetched:", r.rows);
  return new Response(JSON.stringify(r.rows), { status: 200 });
}


    // -------- GET ORDERS --------
    // if (type === "orders") {
    //   const r = await pool.query(
    //     "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
    //     [id]
    //   );
    //   return new Response(JSON.stringify(r.rows));
    // }

    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  } catch (err) {
    console.error("GET ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
