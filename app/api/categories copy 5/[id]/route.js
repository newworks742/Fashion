// app/api/profile/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from '@/lib/db';

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    // Validate input
    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), { status: 400 });
    }

    // Check if new email already exists (if email changed)
    if (email !== session.user.email) {
      const exists = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND email != $2 LIMIT 1", 
        [email, session.user.email]
      );
      
      if (exists.rows.length) {
        return new Response(JSON.stringify({ error: "Email already exists" }), { status: 409 });
      }
    }

    // Update user profile
    const updateQuery = `
      UPDATE users 
      SET first_name = $1, email = $2, phone = $3, updated_at = NOW()
      WHERE email = $4
      RETURNING id, email, first_name, phone
    `;
    
    const result = await pool.query(updateQuery, [name, email, phone || null, session.user.email]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: result.rows[0] 
    }), { status: 200 });

  } catch (err) {
    console.error("Profile update error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}