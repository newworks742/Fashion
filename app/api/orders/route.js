import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM orders WHERE userid = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return Response.json(result.rows, { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}