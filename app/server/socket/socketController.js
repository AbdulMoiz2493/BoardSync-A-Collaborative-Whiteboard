import User from '../models/User.js';
import Board from '../models/Board.js';

// Keep track of connected users and their rooms
const activeUsers = new Map();
const boardUsers = new Map();
// Store the latest state of each board
const boardStates = new Map();
// Use a Map to track pending updates and throttle database writes
const pendingBoardUpdates = new Map();

// Throttled database update function to reduce write load
const updateBoardElements = async (boardId, elements, viewBackgroundColor) => {
  // If there's already a pending update for this board, just update the elements
  if (pendingBoardUpdates.has(boardId)) {
    pendingBoardUpdates.get(boardId).elements = elements;
    pendingBoardUpdates.get(boardId).viewBackgroundColor = viewBackgroundColor;
    return;
  }
  
  // Otherwise, schedule an update
  pendingBoardUpdates.set(boardId, { elements, viewBackgroundColor });
  
  // Process this update after a delay
  setTimeout(async () => {
    try {
      const pendingUpdate = pendingBoardUpdates.get(boardId);
      pendingBoardUpdates.delete(boardId);
      
      if (!pendingUpdate) return;
      
      // Update the board in database
      const board = await Board.findById(boardId);
      if (!board) {
        console.error(`Board ${boardId} not found`);
        return;
      }
      
      board.elements = pendingUpdate.elements;
      board.viewBackgroundColor = pendingUpdate.viewBackgroundColor;
      board.updatedAt = new Date();
      await board.save();
      
      console.log(`Updated board ${boardId} in database`);
    } catch (error) {
      console.error('Error updating board elements:', error);
    }
  }, 500); // Throttle database writes to at most once every 500ms per board
};

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    let currentBoardId = null;
    let currentUserId = null;
  
    // Join a board room
    socket.on('join-board', async (data) => {
      const { boardId, userId } = data;
      if (!boardId || !userId) return;
      
      currentBoardId = boardId;
      currentUserId = userId;
      
      // Join the room
      socket.join(`board-${boardId}`);
      console.log(`User ${userId} joined board: ${boardId}`);
      
      // Store user info
      activeUsers.set(socket.id, { userId, socketId: socket.id });
      
      // Track users in this board
      if (!boardUsers.has(boardId)) {
        boardUsers.set(boardId, new Map());
      }
      
      const users = boardUsers.get(boardId);
      
      // Initialize user data object first
      const userData = {
        userId,
        socketId: socket.id,
        joinedAt: Date.now(),
        name: 'Unknown User', // Provide default values
        email: ''
      };
      
      // Set the user data in the map
      users.set(userId, userData);
      
      try {
        // Get user info from database
        const user = await User.findById(userId).select('name email');
        if (user) {
          userData.name = user.name;
          userData.email = user.email;
        }
        
        // Fetch the latest board state from database if not in memory
        if (!boardStates.has(boardId)) {
          const board = await Board.findById(boardId);
          if (board) {
            boardStates.set(boardId, {
              elements: board.elements || [],
              viewBackgroundColor: board.viewBackgroundColor
            });
          }
        }
        
        // Send the current board state to the newly joined user
        const currentState = boardStates.get(boardId);
        if (currentState) {
          socket.emit('board-state', {
            elements: currentState.elements,
            viewBackgroundColor: currentState.viewBackgroundColor
          });
        }
      } catch (error) {
        console.error('Error fetching user or board info:', error);
      }
      
      // Notify other users in the room
      socket.to(`board-${boardId}`).emit('user-joined', {
        userId,
        name: userData.name,
        joinedAt: userData.joinedAt
      });
      
      // Send the currently active users to the newly joined user
      const activeUsersInBoard = Array.from(users.values());
      socket.emit('active-users', activeUsersInBoard);
    });
  
    // Leave a board room
    socket.on('leave-board', (boardId) => {
      if (!boardId) return;
      
      socket.leave(`board-${boardId}`);
      console.log(`User left board: ${boardId}`);
      
      // Remove user from board users
      if (currentUserId && boardUsers.has(boardId)) {
        const users = boardUsers.get(boardId);
        if (users.has(currentUserId)) {
          users.delete(currentUserId);
          
          // Notify other users
          socket.to(`board-${boardId}`).emit('user-left', currentUserId);
        }
        
        // Clean up empty board
        if (users.size === 0) {
          boardUsers.delete(boardId);
          // Optionally, you can also clear the board state from memory
          // boardStates.delete(boardId);
        }
      }
      
      currentBoardId = null;
    });
  
    // Process drawing updates with improved state synchronization
    socket.on('draw', async (data) => {
      const { boardId, userId, elements, timestamp, viewBackgroundColor } = data;
      if (!boardId || !elements) return;
  
      try {
        // Update our in-memory board state
        boardStates.set(boardId, {
          elements,
          viewBackgroundColor
        });
        
        // Broadcast to all OTHER clients in the room
        socket.to(`board-${boardId}`).emit('draw', {
          userId,
          elements,  // Send the COMPLETE elements array
          boardId,
          timestamp,
          viewBackgroundColor
        });
        
        // Update the database (with throttling for performance)
        updateBoardElements(boardId, elements, viewBackgroundColor);
      } catch (error) {
        console.error('Error processing draw event:', error);
      }
    });
    
    // Add a new event for clients to request the latest board state
    socket.on('request-board-state', async (boardId) => {
      if (!boardId) return;
      
      try {
        let boardState = boardStates.get(boardId);
        
        // If not in memory, fetch from database
        if (!boardState) {
          const board = await Board.findById(boardId);
          if (board) {
            boardState = {
              elements: board.elements || [],
              viewBackgroundColor: board.viewBackgroundColor
            };
            boardStates.set(boardId, boardState);
          }
        }
        
        if (boardState) {
          socket.emit('board-state', boardState);
        }
      } catch (error) {
        console.error('Error fetching board state:', error);
      }
    });
    
    // Track cursor positions
    socket.on('cursor-position', (data) => {
      const { boardId, userId, x, y } = data;
      if (!boardId || !userId) return;
      
      // Broadcast cursor position to other users in the room
      socket.to(`board-${boardId}`).emit('cursor-position', { userId, x, y });
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove from active users
      activeUsers.delete(socket.id);
      
      // Remove from all board rooms
      if (currentUserId && currentBoardId) {
        if (boardUsers.has(currentBoardId)) {
          const users = boardUsers.get(currentBoardId);
          if (users.has(currentUserId)) {
            users.delete(currentUserId);
            
            // Notify other users
            socket.to(`board-${currentBoardId}`).emit('user-left', currentUserId);
          }
          
          // Clean up empty board
          if (users.size === 0) {
            boardUsers.delete(currentBoardId);
          }
        }
      }
    });
  });
};

export default setupSocketIO;