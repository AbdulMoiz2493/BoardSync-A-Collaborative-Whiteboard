import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all notifications for a user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a notification
router.put('/notifications/:notificationId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find notification
    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.status = status;
    await user.save();
    
    res.json({ message: 'Notification updated successfully' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/notifications/read-all', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Mark all notifications as read
    user.notifications.forEach(notification => {
      if (notification.status === 'unread') {
        notification.status = 'read';
      }
    });
    
    await user.save();
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;