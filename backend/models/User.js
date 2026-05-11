import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const addressSchema = new mongoose.Schema(
  {
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    label: { type: String, default: "Home" },
  },
  { _id: true }
);

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedAddresses: [addressSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    banReason: { type: String, default: "" },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword=async function(enteredPassword)
{
    return await bcrypt.compare(enteredPassword,this.password)
}
export default mongoose.model('User',userSchema);
