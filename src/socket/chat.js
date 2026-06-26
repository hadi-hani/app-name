const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const SECRET = process.env.JWT_SECRET;
const MAX_MSG_LENGTH = 500;
const MSG_RATE_LIMIT = 10; // max messages per 10 seconds per user

module.exports = (io) => {

  // Socket auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, SECRET);
      socket.username = decoded.username;
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[${new Date().toISOString()}] ${socket.username} connected`);

    // Per-user message rate limiter
    let msgCount = 0;
    const resetInterval = setInterval(() => { msgCount = 0; }, 10000);

    // Send last 50 messages
    try {
      const messages = await Message.find().sort({ createdAt: -1 }).limit(50).lean();
      socket.emit('history', messages.reverse());
    } catch (err) {
      console.error('History error:', err.message);
    }

    io.emit('user_joined', { username: socket.username });

    socket.on('message', async (text) => {
      // Rate limit: max 10 messages per 10 seconds
      if (msgCount >= MSG_RATE_LIMIT) {
        socket.emit('error_msg', 'ترسل بسرعة كبيرة، تمهّل قليلاً.');
        return;
      }
      // Validate
      if (!text || typeof text !== 'string') return;
      const trimmed = text.trim();
      if (trimmed.length === 0 || trimmed.length > MAX_MSG_LENGTH) {
        socket.emit('error_msg', `الرسالة يجب أن تكون بين 1 و ${MAX_MSG_LENGTH} حرف.`);
        return;
      }
      msgCount++;
      try {
        const msg = await Message.create({ username: socket.username, text: trimmed });
        io.emit('message', { username: socket.username, text: msg.text, createdAt: msg.createdAt });
      } catch (err) {
        console.error('Message error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      clearInterval(resetInterval);
      io.emit('user_left', { username: socket.username });
      console.log(`[${new Date().toISOString()}] ${socket.username} disconnected`);
    });
  });
};
