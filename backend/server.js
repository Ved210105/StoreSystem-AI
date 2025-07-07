import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import assistantRoutes from './routes/assistant.js';
import ordersRoutes from './routes/orders.js';
import notificationsRouter from './routes/notifications.js';


dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', // adjust as needed
  credentials: true,
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;



mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})


  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRouter); 