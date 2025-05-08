import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import boardRoutes from './routes/boards.js';
import collaboratorRoutes from './routes/collaborators.js';
import notificationRoutes from './routes/notifications.js';

// Import socket controller
import initSocketServer from './socket/socketController.js';

dotenv.config();

// Create Express app
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', collaboratorRoutes);
app.use('/api', notificationRoutes);

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Adjust to your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Enable WebSocket compression for better performance
  perMessageDeflate: {
    threshold: 1024, // Only compress messages larger than 1KB
  }
});

// Initialize socket controller
initSocketServer(io);