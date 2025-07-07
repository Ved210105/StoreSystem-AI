import express from 'express';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// Get all products (for dashboard)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// Admin: Add product
router.post('/', authenticate, authorize(['admin', 'store']), async (req, res) => {
  try {
    const { storeId, name, brand, category, description, price, inventory, images, arModelUrl, tags, rating, isEcoFriendly, hotspots } = req.body;
    // If store, force storeId to be their own
    let finalStoreId = req.user.role === 'store' ? req.user.id : storeId;
    const product = new Product({ storeId: finalStoreId, name, brand, category, description, price, inventory, images, arModelUrl, tags, rating, isEcoFriendly, hotspots });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
});

// Admin/Store: Update product
router.put('/:id', authenticate, authorize(['admin', 'store']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Store can only update their own products
    if (req.user.role === 'store' && product.storeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// Admin/Store: Delete product
router.delete('/:id', authenticate, authorize(['admin', 'store']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Store can only delete their own products
    if (req.user.role === 'store' && product.storeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

// GET /api/products/stats
// Returns: { productsSold, storesOnboarded, ecoProducts, activeUsers }
router.get('/stats', async (req, res) => {
  try {
    // Total products sold
    const orders = await Order.find({}, 'items');
    let productsSold = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        productsSold += item.qty;
      });
    });
    // Stores onboarded
    const storesOnboarded = await User.countDocuments({ role: 'store' });
    // Eco products
    const ecoProducts = await Product.countDocuments({ isEcoFriendly: true });
    // Active users (all users)
    const activeUsers = await User.countDocuments({ role: 'user' });
    res.json({ productsSold, storesOnboarded, ecoProducts, activeUsers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

export default router; 