import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Board from '../models/Board.js';
import User from '../models/User.js';

const router = express.Router();

// Get all boards for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const myBoards = await Board.find({
      createdBy: req.userId
    }).populate('createdBy', 'name');
    
    const collaboratorBoards = await Board.find({
      'collaborators.userId': req.userId,
      'collaborators.status': 'accepted'
    }).populate('createdBy', 'name');
    
    const allBoards = [...myBoards, ...collaboratorBoards];
    
    // Format the boards to match frontend expectations
    const formattedBoards = allBoards.map(board => {
      return {
        id: board._id,
        name: board.name,
        createdAt: board.createdAt.toISOString().split('T')[0],
        updatedAt: board.updatedAt.toISOString().split('T')[0],
        lastViewed: board.lastViewed.toISOString().split('T')[0],
        isFavorite: board.isFavorite,
        createdBy: board.createdBy._id.toString(),
        createdByName: board.createdBy.name,
        collaboratorsCount: board.collaborators.filter(c => c.status === 'accepted').length
      };
    });
    
    res.json(formattedBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new board
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const board = new Board({
      name: name || 'Whiteboard',
      createdBy: req.userId,
      elements: []
    });
    
    await board.save();
    
    res.status(201).json({
      message: 'Board created successfully',
      id: board._id
    });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single board
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('createdBy', 'name');
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user has access to this board
    const isOwner = board.createdBy._id.toString() === req.userId;
    const isCollaborator = board.collaborators.some(
      c => c.userId && c.userId.toString() === req.userId && c.status === 'accepted'
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }
    
    // Update lastViewed
    board.lastViewed = new Date();
    await board.save();
    
    res.json({
      id: board._id,
      name: board.name,
      elements: board.elements,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      isFavorite: board.isFavorite,
      createdBy: board.createdBy._id.toString(),
      createdByName: board.createdBy.name,
      collaborators: board.collaborators
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle favorite status
router.post('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const { isFavorite } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user has access to this board
    const isOwner = board.createdBy.toString() === req.userId;
    const isCollaborator = board.collaborators.some(
      c => c.userId && c.userId.toString() === req.userId && c.status === 'accepted'
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }
    
    board.isFavorite = isFavorite;
    await board.save();
    
    res.json({ message: 'Board updated successfully' });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update board
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, elements } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user has edit access
    const isOwner = board.createdBy.toString() === req.userId;
    const isCollaboratorWithEditAccess = board.collaborators.some(
      c => c.userId && c.userId.toString() === req.userId && c.status === 'accepted' && c.accessLevel === 'edit'
    );
    
    if (!isOwner && !isCollaboratorWithEditAccess) {
      return res.status(403).json({ message: 'You do not have permission to edit this board' });
    }
    
    // Update the fields that were provided
    if (name !== undefined) board.name = name;
    if (elements !== undefined) board.elements = elements;
    
    board.updatedAt = new Date();
    await board.save();
    
    res.json({ message: 'Board updated successfully' });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete board
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user is the creator of the board
    if (board.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this board' });
    }
    
    // Delete the board
    await Board.findByIdAndDelete(req.params.id);
    
    // Optional: Also remove this board from any user's favorites or other references
    await User.updateMany(
      {}, 
      { $pull: { favoriteBoards: req.params.id } }
    );
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;