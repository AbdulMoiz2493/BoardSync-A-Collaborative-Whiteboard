import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  notifications: [{
    type: { type: String, enum: ['invite', 'system'], default: 'system' },
    message: { type: String, required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    boardName: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    createdAt: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

export default User;