import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Board from '../models/Board.js';
import User from '../models/User.js';

const router = express.Router();

// Get collaborators for a board
router.get('/:id/collaborators', verifyToken, async (req, res) => {
  try {
    console.log(`Fetching collaborators for board ${req.params.id} by user ${req.userId}`);
    
    const board = await Board.findById(req.params.id)
      .populate('collaborators.userId', 'name email');
    
    if (!board) {
      console.log(`Board ${req.params.id} not found`);
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user has access to view collaborators
    const isOwner = board.createdBy.toString() === req.userId;
    const isCollaborator = board.collaborators.some(
      c => c.userId && c.userId.toString() === req.userId && c.status === 'accepted'
    );
    
    if (!isOwner && !isCollaborator) {
      console.log(`User ${req.userId} does not have access to board ${req.params.id}`);
      return res.status(403).json({ message: 'You do not have access to this board' });
    }
    
    // Format collaborators for frontend
    const collaborators = board.collaborators.map(c => {
      return {
        id: c._id,
        userId: c.userId ? c.userId._id : null,
        name: c.userId ? c.userId.name : null,
        email: c.email,
        accessLevel: c.accessLevel,
        status: c.status,
        invitedAt: c.invitedAt
      };
    });
    
    res.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite collaborator to a board
router.post('/:id/invite', verifyToken, async (req, res) => {
  try {
    const { email, accessLevel } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the owner
    if (board.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the board owner can invite collaborators' });
    }
    
    // Check if email is already a collaborator
    const existingCollaborator = board.collaborators.find(c => c.email === email);
    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }
    
    // Find user by email (if they exist in the system)
    const user = await User.findOne({ email });
    
    // Create collaborator object
    const collaborator = {
      email,
      accessLevel: accessLevel || 'view',
      status: 'pending'
    };
    
    // If user exists, add their userId
    if (user) {
      collaborator.userId = user._id;
      collaborator.name = user.name;
      
      // Create notification for the user
      const inviter = await User.findById(req.userId);
      user.notifications.push({
        type: 'invite',
        message: `${inviter.name} invited you to collaborate on a whiteboard`,
        boardId: board._id,
        boardName: board.name,
        senderId: req.userId,
        senderName: inviter.name
      });
      
      await user.save();
    }
    
    // Add collaborator to board
    board.collaborators.push(collaborator);
    await board.save();
    
    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collaborator access level
router.put('/:id/collaborators/:collaboratorId', verifyToken, async (req, res) => {
  try {
    const { accessLevel } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the owner
    if (board.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the board owner can modify collaborators' });
    }
    
    // Find and update collaborator
    const collaborator = board.collaborators.id(req.params.collaboratorId);
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    collaborator.accessLevel = accessLevel;
    await board.save();
    
    res.json({ message: 'Collaborator updated successfully' });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove collaborator
router.delete('/:id/collaborators/:collaboratorId', verifyToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the owner
    if (board.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the board owner can remove collaborators' });
    }
    
    // Find and remove collaborator
    board.collaborators = board.collaborators.filter(
      c => c._id.toString() !== req.params.collaboratorId
    );
    
    await board.save();
    
    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle invitation responses
router.post('/invitations/respond', verifyToken, async (req, res) => {
  try {
    console.log('Received request to /api/invitations/respond:', req.body);
    console.log('User ID from token:', req.userId);

    const { notificationId, boardId, response } = req.body;
    
    // Validate request body
    if (!notificationId || !boardId || !response) {
      return res.status(400).json({ message: 'Missing required fields: notificationId, boardId, or response' });
    }

    // Find user and remove the notification
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found for ID:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user._id);
    console.log('Notifications array:', user.notifications);

    // Find the notification to confirm it exists
    const notification = user.notifications.id(notificationId);
    if (!notification) {
      console.log('Notification not found for ID:', notificationId);
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Remove the notification from the user's notifications array
    user.notifications.pull(notificationId);
    await user.save();
    console.log('Notification removed after response');

    // Update collaborator status in board
    const board = await Board.findById(boardId);
    if (!board) {
      console.log('Board not found for ID:', boardId);
      return res.status(404).json({ message: 'Board not found' });
    }
    
    console.log('Board found:', board._id);
    console.log('Collaborators array:', board.collaborators);

    // Find collaborator by email
    const collaborator = board.collaborators.find(
      c => (c.email === user.email || c.email === req.body.email) && c.status === 'pending'
    );
    
    if (!collaborator) {
      console.log('Collaborator not found for email:', user.email);
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    collaborator.status = response; // 'accepted' or 'rejected'
    await board.save();
    console.log('Collaborator status updated to:', response);

    res.json({ message: `Invitation ${response}`, success: true });
  } catch (error) {
    console.error('Error responding to invitation:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;