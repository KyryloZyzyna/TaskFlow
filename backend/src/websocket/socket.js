import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  // Middleware для авторизації WebSocket з'єднань
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = user.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Приєднатися до room (board)
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.userId} joined board ${boardId}`);
    });

    // Покинути room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.userId} left board ${boardId}`);
    });

    // Task створено
    socket.on('task:created', (data) => {
      const { boardId, task } = data;
      socket.to(`board:${boardId}`).emit('task:created', { task });
    });

    // Task оновлено
    socket.on('task:updated', (data) => {
      const { boardId, task } = data;
      socket.to(`board:${boardId}`).emit('task:updated', { task });
    });

    // Task переміщено
    socket.on('task:moved', (data) => {
      const { boardId, taskId, columnId, position } = data;
      socket.to(`board:${boardId}`).emit('task:moved', {
        taskId,
        columnId,
        position
      });
    });

    // Task видалено
    socket.on('task:deleted', (data) => {
      const { boardId, taskId } = data;
      socket.to(`board:${boardId}`).emit('task:deleted', { taskId });
    });

    // Column створено
    socket.on('column:created', (data) => {
      const { boardId, column } = data;
      socket.to(`board:${boardId}`).emit('column:created', { column });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });

  console.log('🔌 WebSocket initialized');
};