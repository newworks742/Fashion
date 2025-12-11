import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET - Fetch user addresses
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
        'SELECT * FROM addresses WHERE userid = $1 ORDER BY isdefault DESC, id DESC LIMIT 2',
        [userId]
      );
      
      return Response.json(result.rows, { status: 200 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Add new address (max 2)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    const { type, street, city, state, zip, country, isDefault } = await request.json();

    const client = await pool.connect();
    
    try {
      // Check if user already has 2 addresses
      const countResult = await client.query(
        'SELECT COUNT(*) FROM addresses WHERE userid = $1',
        [userId]
      );
      
      if (parseInt(countResult.rows[0].count) >= 2) {
        return Response.json({ error: 'Maximum 2 addresses allowed' }, { status: 400 });
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        await client.query(
          'UPDATE addresses SET isdefault = false WHERE userid = $1',
          [userId]
        );
      }

      const result = await client.query(
        'INSERT INTO addresses (userid, type, street, city, state, zip, country, isdefault) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, type, street, city, state, zip, country || 'USA', isDefault]
      );
      
      return Response.json(result.rows[0], { status: 201 });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error adding address:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}