import mongoose from 'mongoose';

const kidsWishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  occasion: { type: String, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  notes: { type: String },
});

export default mongoose.model('KidsWishlist', kidsWishlistSchema); 