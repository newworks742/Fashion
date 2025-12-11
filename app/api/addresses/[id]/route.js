import pool from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// PATCH - Update address
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { type, street, city, state, zip, country, isDefault } = await request.json();
    const userId = session.user.id || session.user.email;

    const client = await pool.connect();
    
    try {
      // If this is set as default, unset other defaults
      if (isDefault) {
        await client.query(
          'UPDATE addresses SET isdefault = false WHERE userid = $1',
          [userId]
        );
      }

      const result = await client.query(
        'UPDATE addresses SET type = $1, street = $2, city = $3, state = $4, zip = $5, country = $6, isdefault = $7 WHERE id = $8 AND userid = $9 RETURNING *',
        [type, street, city, state, zip, country || 'USA', isDefault, id, userId]
      );
      
      if (result.rowCount === 0) {
        return Response.json({ error: 'Address not found' }, { status: 404 });
      }
      
      return Response.json(result.rows[0], { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error updating address:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove address
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id || session.user.email;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM addresses WHERE id = $1 AND userid = $2',
        [id, userId]
      );
      
      if (result.rowCount === 0) {
        return Response.json({ error: 'Address not found' }, { status: 404 });
      }
      
      return Response.json({ success: true }, { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error deleting address:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}