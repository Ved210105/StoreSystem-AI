import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, storeName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role, storeName });
    await user.save();
    const token = generateToken({ id: user._id, role: user.role });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken({ id: user._id, role: user.role });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

export default router; 