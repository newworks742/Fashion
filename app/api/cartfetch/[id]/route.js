import pool from '../../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id } = await params;
    const { qty } = await request.json();

    if (!qty || qty < 1) {
      return Response.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE cart 
         SET qty = $1 
         WHERE id = $2 AND userid = $3 
         RETURNING *`,
        [qty, id, session.user.id]
      );

      if (result.rowCount === 0) {
        return Response.json({ error: 'Item not found' }, { status: 404 });
      }

      return Response.json(result.rows[0], { status: 200 });
    } catch (err) {
      console.error("DB update error:", err);
      return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM cart 
         WHERE id = $1 AND userid = $2`,
        [id, session.user.id]
      );

      if (result.rowCount === 0) {
        return Response.json({ error: 'Item not found' }, { status: 404 });
      }

      return Response.json({ success: true, message: 'Item removed' }, { status: 200 });
    } catch (err) {
      console.error("DB delete error:", err);
      return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
  }
}