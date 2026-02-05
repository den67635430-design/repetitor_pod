// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Validate ALL required environment variables before starting
const { validateEnvironment } = require('./config/env.config');
const config = validateEnvironment();

const JWT_SECRET = config.JWT_SECRET;

// Routes
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const supportRoutes = require('./routes/support.routes');
const parentRoutes = require('./routes/parent.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 50,
  message: { error: 'Лимит вопросов к AI исчерпан' }
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.userId;
    socket.userRole = payload.role;
    next();
  } catch (err) {
    next(new Error('Invalid authentication token'));
  }
});

// Socket.io для real-time (with authentication)
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Client connected:', socket.id, 'User:', socket.userId);
  }
  
  socket.on('join_parent_room', ({ userId }) => {
    // Verify user is authorized to join this room
    if (socket.userRole !== 'PARENT' || socket.userId !== userId) {
      socket.emit('error', { message: 'Unauthorized to join this room' });
      return;
    }
    socket.join(`parent_${userId}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Parent ${userId} joined room`);
    }
  });
  
  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Client disconnected:', socket.id);
    }
  });
});

// Make io available in routes
app.set('io', io);

// Error handling - sanitized responses
app.use((err, req, res, next) => {
  // Log full error server-side only in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Send generic message to client, never expose internal details
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 
      ? 'Произошла ошибка. Попробуйте позже.' 
      : (err.message || 'Произошла ошибка')
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
