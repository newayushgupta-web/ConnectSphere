const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const ApiResponse = require('./utils/apiResponse');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin images/uploads
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize against NoSQL injection
app.use(mongoSanitize());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    'ConnectSphere API is healthy'
  );
});

// Mount Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const autoSeedIfEmpty = require('./utils/autoSeed');

// Start server only when not running in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    // Automatically seed demo data if collection is empty
    await autoSeedIfEmpty();

    server.listen(PORT, () => {
      console.log(`🚀 ConnectSphere Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  });
}

module.exports = { app, server };
