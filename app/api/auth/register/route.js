// app/api/auth/signup/route.js
import { hash } from "bcrypt";
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, phone, country } = body;

    console.log(body,"bodugfggfv");
    

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    // check exist
    const exists = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (exists.rows.length) {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    // use gen_random_uuid in SQL; if not available, generate in JS
    const insertQuery = `
      INSERT INTO users (id, email, password_hash, first_name, phone, country)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name,phone
    `;
    const values = [email, passwordHash, firstName || null, phone || null, country || null];
    const r = await pool.query(insertQuery, values);
    return new Response(JSON.stringify({ success: true, user: r.rows[0] }), { status: 201 });
  } catch (err) {
    console.error("signup error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
