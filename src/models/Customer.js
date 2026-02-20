import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

// Delete cached model to always use the latest schema
if (mongoose.models.Customer) delete mongoose.models.Customer;
export default mongoose.model("Customer", CustomerSchema);
