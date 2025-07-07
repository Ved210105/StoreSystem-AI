import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for broadcast
  title: { type: String, required: true },
  message: { type: String, required: true },
  discountCode: { type: String },
  type: { type: String, enum: ['discount', 'info', 'other'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Notification', NotificationSchema); 