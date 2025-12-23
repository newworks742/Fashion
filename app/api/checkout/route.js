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
            // Fetch addresses
            const addressResult = await client.query(
                `SELECT * FROM addresses WHERE "userId" = $1 ORDER BY "is_default" DESC`,
                [userid]
            );

            return Response.json({
                addresses: addressResult.rows,
                addressCount: addressResult.rowCount
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




export async function PUT(req) {
    try {
        const body = await req.json();
        console.log(body, "bodybodybodybody");
        
        const {
            userId,
            type,
            fullName,
            mobile,
            flatNo,
            area,
            landmark,
            pincode,
            city,
            state,
            country,
            isDefault,
        } = body;

        // Validate required fields
        if (!userId || !fullName || !mobile || !pincode || !city || !state) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }), 
                { status: 400 }
            );
        }

        // If this address is set as default, unset all other default addresses for this user
        if (isDefault) {
            await pool.query(
                `UPDATE addresses SET "is_default" = false WHERE "userId" = $1`,
                [userId]
            );
        }

        // Insert new address
        const query = `
            INSERT INTO addresses (
                "userId",
                "type",
                "fullName",
                "mobile",
                "flatNo",
                "area",
                "landmark",
                "pincode",
                "city",
                "state",
                "country",
                "is_default"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            userId,
            type || 'home',
            fullName,
            mobile,
            flatNo || '',
            area || '',
            landmark || '',
            pincode,
            city,
            state,
            country || 'India',
            isDefault || false,
        ]);

        return new Response(
            JSON.stringify({ 
                success: true, 
                address: result.rows[0] 
            }), 
            { status: 201 }
        );

    } catch (err) {
        console.error("ADDRESS ERROR:", err);
        return new Response(
            JSON.stringify({ 
                error: "Server error", 
                detail: err.message 
            }), 
            { status: 500 }
        );
    }
}