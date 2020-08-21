const userConnectionManager = require('./repo/userConnections');
const chatManager = require('./repo/chats');

module.exports = server => {
  const io = require('socket.io')(server);

  chatManager.setSocket(io);

  io.on('connection', (socket) => {
    socket.on('online', userId => {
      console.log(`userId ${userId} is online. socketId: ${socket.id}`);
      userConnectionManager.submitConnection(userId, socket.id, socket)
    });

    socket.on('offline', userId => {
      console.log(`userId ${userId} is offline. socketId: ${socket.id}`);
      userConnectionManager.signOut(userId);
    });

    socket.on('disconnect', reason => {
      console.log(`a user got disconnected. reason: ${reason} socketId: ${socket.id}`);
      userConnectionManager.removeConnection(socket.id);
    });
  });
}