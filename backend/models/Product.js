import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  inventory: { type: Number, default: 0 },
  images: [{ type: String }],
  arModelUrl: { type: String },
  tags: [{ type: String }],
  rating: { type: Number, default: 0 },
  isEcoFriendly: { type: Boolean, default: false },
  hotspots: [{ type: Object }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema); 