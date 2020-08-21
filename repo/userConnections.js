
const users = require('./users');
class UserConnectionsModel {
  constructor(userId) {
    this.userId = userId;
    this.connections = [];
  }

  addConnection(connectionId) {
    if (!this.connections.some(x => x === connectionId)) {
      this.connections.push(connectionId);
    }
  }

  removeConnection(connectionId) {
    const index = this.connections.indexOf(connectionId);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }
  }
}

class UserConnection {
  constructor() {
    this.data = [];
  }

  submitConnection(userId, connectionId, socket) {
    let item = this.data.find(x => x.userId === userId);
    if(!item) {
      item = new UserConnectionsModel(userId);
      this.data.push(item);
      const user = users.get(userId);
      socket.broadcast.emit('new-user', user);
    }
    item.addConnection(connectionId);
  }

  removeConnection(connectionId) {
    this.data.forEach(userConnections => userConnections.removeConnection(connectionId));
  }

  signOut(userId) {
    this.data = this.data.filter(x => x.userId !== userId);
  }

  getUserConnections(userId) {
    return (this.data.find(x => x.userId === userId) || { connections: [] }).connections;
  }
}

module.exports = new UserConnection();