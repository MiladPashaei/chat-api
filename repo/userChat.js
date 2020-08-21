
class UserChat {
  constructor(userId, chatId, messageId) {
    this.userId = userId;
    this.chatId = chatId;
    this.messageId = messageId;
  }
}
class UserChatRepository {
  constructor() {
    this.items = [];
  }

  addOrUpdate(userId, chatId, messageId) {
    const item = this.exists(userId, chatId) || new UserChat(userId, chatId, messageId);
    item.messageId = messageId;
  }

  exists(userId, chatId) {
    return this.items.find(x => x.userId === userId && x.chatId === chatId);
  }

  getLastReadMessageId(userId, chatId) {
    return (this.exists(userId, chatId) || { messageId: null }).messageId;
  }
}

module.exports = new UserChatRepository();