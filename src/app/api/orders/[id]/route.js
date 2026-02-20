import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

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

// PUT update order — manage stock based on status transitions
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const existing = await Order.findById(params.id);
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (body.status && body.status !== existing.status) {
      const from = existing.status;
      const to = body.status;

      // pending → processing/completed: deduct stock
      if (from === "pending" && to !== "cancelled") {
        for (const item of existing.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      // processing/completed → cancelled: restore stock
      if (from !== "pending" && from !== "cancelled" && to === "cancelled") {
        for (const item of existing.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: +item.quantity },
          });
        }
      }
    }

    const order = await Order.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

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
