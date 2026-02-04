// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const supportRoutes = require('./routes/support.routes');
const parentRoutes = require('./routes/parent.routes');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: 'Слишком много запросов, попробуйте позже'
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 50,
  message: 'Лимит вопросов к AI исчерпан'
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/parent', parentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io для real-time
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_parent_room', ({ userId }) => {
    socket.join(`parent_${userId}`);
    console.log(`Parent ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available in routes
app.set('io', io);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
