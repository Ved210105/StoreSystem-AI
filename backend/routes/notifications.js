import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { userId, title, message, discountCode, type } = req.body;
    const notification = await Notification.create({
      userId: userId || null,
      title,
      message,
      discountCode,
      type: type || 'info',
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notifications for logged-in user (targeted + broadcast)
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user.id },
        { userId: null },
      ],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: req.user.id },
          { userId: null },
        ],
      },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all users for notification dropdown
router.get('/users/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete a notification
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as unread (admin only)
router.patch('/:id/unread', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { read: false },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 