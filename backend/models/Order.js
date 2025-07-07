import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      qty: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  address: { type: String, required: true },
  orderedAt: { type: Date, default: Date.now },
  paymentIntentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
});

export default mongoose.model('Order', orderSchema); 