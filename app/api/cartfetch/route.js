import pool from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";  

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userid = session.user.id;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           c.id as cart_id,
           c.userid, 
           c.product_id, 
           c.name as cart_name,
           c.price as cart_price,
           c.category as cart_category,
           c.size as cart_size,
           c.color as cart_color,
           c.qty,
           p.id as product_id,
           p.product_name,
           p.price,
           p.discounted_price,
           p.discount,
           p.category,
           p.subcategory,
           p.type,
           p.sizes,
           p.colors,
           p.rating,
           p.reviews,
           p.image,
           p.image_mime,
           p.producturl,
           p.details
         FROM cart c
         LEFT JOIN product p ON c.product_id = p.id
         WHERE c.userid = $1
        `,
        [userid]
      );
      
      // Map the results to use cart_id as the primary id
      const items = result.rows.map(row => ({
        id: row.cart_id,  // Use cart ID as the unique identifier
        userid: row.userid,
        product_id: row.product_id,
        name: row.cart_name || row.product_name,
        price: row.cart_price || row.price,
        category: row.cart_category || row.category,
        size: row.cart_size,
        color: row.cart_color,
        qty: row.qty,
        // Product details
        product_name: row.product_name,
        discounted_price: row.discounted_price,
        discount: row.discount,
        subcategory: row.subcategory,
        type: row.type,
        sizes: row.sizes,
        colors: row.colors,
        rating: row.rating,
        reviews: row.reviews,
        image: row.image,
        image_mime: row.image_mime,
        producturl: row.producturl,
        details: row.details
      }));
      
      return Response.json({
        items: items,
        total: result.rowCount
      }, { status: 200 });
      
    } catch (err) {
      console.error("DB select error:", err);
      return Response.json({ error: "Database error", detail: err.message }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Unexpected server error", detail: err.message }, { status: 500 });
  }
}
