import mongoose from 'mongoose';

const collaboratorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  name: { type: String },
  accessLevel: { type: String, enum: ['view', 'edit'], default: 'view' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  invitedAt: { type: Date, default: Date.now }
});

const boardSchema = new mongoose.Schema({
  name: { type: String, default: 'Whiteboard' },
  elements: { type: Array, default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastViewed: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false },
  viewBackgroundColor: { type: String },
  collaborators: [collaboratorSchema]
});

const Board = mongoose.model('Board', boardSchema);

export default Board;