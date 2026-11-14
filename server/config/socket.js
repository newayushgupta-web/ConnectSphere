let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // When a user logs in and joins with their user id
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave_user_room', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Helper to emit notification to a specific user
const emitToUser = (userId, eventName, data) => {
  if (io && userId) {
    io.to(`user:${userId.toString()}`).emit(eventName, data);
  }
};

module.exports = { initSocket, getIO, emitToUser };
