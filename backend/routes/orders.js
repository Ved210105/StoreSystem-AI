import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import Product from '../models/Product.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place an order (create order, initiate Stripe payment intent)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, address, paymentMode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    // Calculate total and check stock
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (product.inventory < item.qty) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      total += product.price * item.qty;
    }
    // Create Stripe payment intent if card
    let paymentIntentId = null;
    let clientSecret = null;
    if (paymentMode === 'card') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // in cents
        currency: 'usd',
        metadata: { userId: req.user.id },
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    }
    // Save order
    const order = await Order.create({
      userId: req.user.id,
      items: await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          productId: item.productId,
          qty: item.qty,
          priceAtPurchase: product.price,
        };
      })),
      total,
      paymentMode,
      paymentIntentId,
      paymentStatus: paymentMode === 'card' ? 'pending' : 'paid',
      status: 'pending',
      address,
    });
    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { inventory: -item.qty } });
    }
    res.json({ orderId: order._id, clientSecret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ orderedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specific order for user
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all orders
router.get('/admin/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update order status
router.patch('/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stripe webhook for payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update order payment status
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'paid', status: 'pending' }
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'failed', status: 'cancelled' }
    );
  }
  res.json({ received: true });
});

export default router; 