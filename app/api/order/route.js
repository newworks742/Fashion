import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/**
 * GET → Fetch user orders
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id; // must be UUID
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT *
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC`,
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

/**
 * POST → Store a new order
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id; // UUID
    const body = await request.json();

    const { address_id, payment_method, items } = body;

    // Basic validation
    if (!address_id || !payment_method || !items || !Array.isArray(items)) {
      return Response.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `INSERT INTO orders (address_id, payment_method, user_id, items)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [address_id, payment_method, userId, JSON.stringify(items)]
      );

      return Response.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
