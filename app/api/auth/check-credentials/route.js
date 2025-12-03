import { compare } from "bcrypt";
import pool from "@/lib/db"; // adjust path
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `SELECT id, email, password_hash, first_name, phone FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );

    const user = res.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email", field: "email" },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { error: "Invalid account configuration" },
        { status: 401 }
      );
    }

    const valid = await compare(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password", field: "password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Check credentials error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}