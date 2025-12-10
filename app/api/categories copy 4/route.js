import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Address from "@/models/Address";

export async function GET(req) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get("userId");

  const addresses = await Address.find({ userId });
  return NextResponse.json({ addresses });
}

export async function POST(req) {
  await connectDB();
  const { userId, address } = await req.json();

  const count = await Address.countDocuments({ userId });

  if (count >= 2) {
    return NextResponse.json(
      { error: "Only 2 addresses allowed!" },
      { status: 400 }
    );
  }

  const newAddress = await Address.create({ userId, ...address });

  return NextResponse.json({ newAddress });
}
