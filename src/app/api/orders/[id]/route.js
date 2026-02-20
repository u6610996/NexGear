import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

// GET single order
export async function GET(request, { params }) {
  try {
    await connectDB();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update order
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const order = await Order.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE order
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const order = await Order.findByIdAndDelete(params.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
