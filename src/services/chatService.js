import socket from '../socket';

export const joinRoom = (room) => {
  socket.emit('joinRoom', room);
};

export const sendMessage = (data) => {
  socket.emit('message', data);
};

export const onMessage = (callback) => {
  socket.on('message', callback);
};
