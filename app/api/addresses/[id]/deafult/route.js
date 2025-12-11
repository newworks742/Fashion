import pool from '../../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id || session.user.email;
    const client = await pool.connect();
    
    try {
      // Unset all defaults
      await client.query(
        'UPDATE addresses SET isdefault = false WHERE userid = $1',
        [userId]
      );

      // Set this one as default
      const result = await client.query(
        'UPDATE addresses SET isdefault = true WHERE id = $1 AND userid = $2 RETURNING *',
        [id, userId]
      );
      
      if (result.rowCount === 0) {
        return Response.json({ error: 'Address not found' }, { status: 404 });
      }
      
      return Response.json(result.rows[0], { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error setting default address:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}