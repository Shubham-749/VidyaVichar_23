import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token, lectureId) => {
  if (socket) {
    disconnectSocket();
  }

  socket = io('http://localhost:3000', {
    query: { token },
    transports: ['websocket'],
    autoConnect: true
  });

  // Join lecture room
  if (lectureId) {
    socket.emit('joinLecture', { lectureId });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call connectSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    // Leave lecture room if joined
    if (socket.connected) {
      const lectureId = socket.io.opts.query.lectureId;
      if (lectureId) {
        socket.emit('leaveLecture', { lectureId });
      }
    }
    socket.disconnect();
    socket = null;
  }
};

// Socket event handlers
export const onQuestionCreated = (callback) => {
  const socket = getSocket();
  socket.on('newQuestion', callback);
  return () => socket.off('newQuestion', callback);
};

export const onQuestionUpdated = (callback) => {
  const socket = getSocket();
  socket.on('questionUpdated', callback);
  return () => socket.off('questionUpdated', callback);
};

export const onImportantToggled = (callback) => {
  const socket = getSocket();
  socket.on('importantToggled', callback);
  return () => socket.off('importantToggled', callback);
};

export const onQuestionStatusUpdated = (callback) => {
  const socket = getSocket();
  socket.on('questionStatusUpdated', callback);
  return () => socket.off('questionStatusUpdated', callback);
};