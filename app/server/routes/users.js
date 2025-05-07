import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user data endpoint
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Ensure the requested user ID matches the authenticated user's ID
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;