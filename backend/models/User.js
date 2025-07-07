import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'store', 'admin'], default: 'user' },
  preferences: { type: Object, default: {} },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      qty: { type: Number, default: 1 },
    },
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  storeName: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  prompts: [{ type: String }],
});

export default mongoose.model('User', userSchema); 