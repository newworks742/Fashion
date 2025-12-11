import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import pool from "@/lib/db";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone } = await req.json();
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE users SET name = $1, phone = $2 WHERE email = $3 RETURNING id, name, email, phone',
        [name, phone, session.user.email]
      );
      
      if (result.rows.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      
      return Response.json({ 
        success: true, 
        user: result.rows[0] 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json({ error: 'Server error', detail: error.message }, { status: 500 });
  }
}