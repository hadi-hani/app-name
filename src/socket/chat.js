const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const SECRET = process.env.JWT_SECRET || 'secret123';

module.exports = (io) => {
  // Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, SECRET);
      socket.username = decoded.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`${socket.username} connected`);

    // Send last 50 messages on connect
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50).lean();
    socket.emit('history', messages.reverse());

    // Notify everyone
    io.emit('user_joined', { username: socket.username });

    // Handle new message
    socket.on('message', async (text) => {
      if (!text || typeof text !== 'string' || text.trim().length === 0) return;
      const msg = await Message.create({ username: socket.username, text: text.trim() });
      io.emit('message', { username: socket.username, text: msg.text, createdAt: msg.createdAt });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      io.emit('user_left', { username: socket.username });
      console.log(`${socket.username} disconnected`);
    });
  });
};
