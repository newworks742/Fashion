import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Your database connection

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories LIMIT 10');
    
    return NextResponse.json({
      success: true,
      categories: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}