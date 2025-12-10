// app/api/addresses/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Address from "@/models/Address";
import User from "@/models/User";

// GET all addresses for user
export async function GET(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Get addresses
    const addresses = await Address.find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    // Convert MongoDB _id to id for frontend compatibility
    const formattedAddresses = addresses.map(addr => ({
      id: addr._id.toString(),
      type: addr.type,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      default: addr.isDefault || false,
      createdAt: addr.createdAt
    }));

    return new Response(JSON.stringify(formattedAddresses), { status: 200 });

  } catch (err) {
    console.error("Get addresses error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// POST new address
export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { type, street, city, state, zip, default: isDefault } = body;

    // Validate required fields
    if (!street || !city || !state || !zip) {
      return new Response(JSON.stringify({ error: "All address fields are required" }), { status: 400 });
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Check address limit (max 2)
    const addressCount = await Address.countDocuments({ userId: user._id });
    if (addressCount >= 2) {
      return new Response(JSON.stringify({ error: "Maximum 2 addresses allowed" }), { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: user._id },
        { isDefault: false }
      );
    }

    // Create new address
    const newAddress = await Address.create({
      userId: user._id,
      type: type || 'Home',
      street,
      city,
      state,
      zip,
      isDefault: isDefault || false
    });

    // Format response
    const formattedAddress = {
      id: newAddress._id.toString(),
      type: newAddress.type,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zip: newAddress.zip,
      default: newAddress.isDefault,
      createdAt: newAddress.createdAt
    };

    return new Response(JSON.stringify(formattedAddress), { status: 201 });

  } catch (err) {
    console.error("Add address error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}