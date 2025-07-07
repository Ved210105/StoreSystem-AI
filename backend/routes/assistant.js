import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Chat from '../models/Chat.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();
const GEMINI_API_KEY = 'AIzaSyBUscqImEE_J71m07Lr0a2oJqecIOXXSak';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function getGeminiResponse(prompt) {
  const res = await fetch(GEMINI_API_URL + `?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts.map(p => p.text).join(' ');
  }
  return 'Sorry, I could not generate a response right now.';
}

// POST /api/assistant/ask
router.post('/ask', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    const user = await User.findById(req.user.id);
    let response = '';

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Role-based context for Gemini
    let context = '';
    if (user.role === 'user') {
      context = 'You are a helpful AI shopping assistant. Recommend eco-friendly or popular products, answer product-related questions, and help users shop smarter.';
    } else if (user.role === 'store') {
      context = 'You are an AI assistant for a store owner. Give inventory tips, sales suggestions, and help manage store analytics.';
    } else if (user.role === 'admin') {
      context = 'You are an AI assistant for an admin. Provide platform analytics, user/product stats, and moderation tips.';
    } else {
      context = 'You are an AI assistant.';
    }

    // Optionally, add product or user stats to the prompt for richer answers
    let stats = '';
    let extraInfo = '';
    if (user.role === 'user') {
      const ecoCount = await Product.countDocuments({ isEcoFriendly: true });
      const wishlist = await Product.find({ _id: { $in: user.wishlist } }).select('name brand inventory');
      const cart = await Product.find({ _id: { $in: user.cart.map(c => c.productId) } }).select('name brand inventory');
      stats = `There are currently ${ecoCount} eco-friendly products available.`;
      extraInfo = `Your wishlist: ${wishlist.map(p => `${p.name} (${p.brand}) - ${p.inventory} in stock`).join('; ')}.\nYour cart: ${cart.map(p => `${p.name} (${p.brand}) - ${p.inventory} in stock`).join('; ')}.`;
    } else if (user.role === 'store') {
      const lowStock = await Product.countDocuments({ storeId: user._id, inventory: { $lt: 5 } });
      const products = await Product.find({ storeId: user._id }).select('name brand inventory price');
      stats = `You have ${lowStock} products with low inventory.`;
      extraInfo = `Your products: ${products.map(p => `${p.name} (${p.brand}) - ${p.inventory} in stock, $${p.price}`).join('; ')}.`;
    } else if (user.role === 'admin') {
      const userCount = await User.countDocuments();
      const productCount = await Product.countDocuments();
      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role');
      const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).select('name brand inventory');
      stats = `There are ${userCount} users and ${productCount} products on the platform.`;
      extraInfo = `Recent users: ${recentUsers.map(u => `${u.name} (${u.email}) - ${u.role}`).join('; ')}.\nRecent products: ${recentProducts.map(p => `${p.name} (${p.brand}) - ${p.inventory} in stock`).join('; ')}.`;
    }

    const prompt = `${context}\n${stats}\n${extraInfo}\nUser question: ${query}`;
    response = await getGeminiResponse(prompt);

    // Log the chat
    await Chat.create({ userId: user._id, query, response });

    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: 'AI assistant error', error: err.message });
  }
});

export default router; 