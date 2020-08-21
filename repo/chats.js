const PAGE_SIZE = 10;
const userRepo = require('./users');
const userChatRepo = require('./userChat');
const userConnectionsRepo = require('./userConnections');
const { v4 } = require('uuid');

class ChatMessage {
  constructor(content, date, type, userId) {
    this.id = v4();
    this.content = content;
    this.date = date;
    this.type = type;
    this.userId = userId;
  }
}

class Chat {
  constructor(id1, id2) {
    this.id = v4();
    this.delimiter = '__';
    this.uniqueId = `${id1}${this.delimiter}${id2}`;
    this.messages = [];
  }

  get lastMessage() {
    return this.messages.length > 0 ? this.messages[-1] : null;
  }

  getPeerId(userId) {
    return this.uniqueId.split(this.delimiter).find(x => x !== userId);
  }

  getName(userId) {
    const peerId = this.getPeerId(userId);
    return userRepo.get(peerId).name;
  }

  submitTextMessage(userId, content) {
    const message = new ChatMessage(content, new Date(), 1, userId);
    this.messages.push(message);
    return message;
  }
}

class RecentChatModel {
  constructor(id, name, lastMessage, unreadMessageCount) {
    this.id = id;
    this.name = name;
    this.lastMessage = lastMessage;
    this.unreadMessageCount = unreadMessageCount;
  }
}

class ChatRepository {
  constructor() {
    this.chats = [];
  }

  setSocket(io) {
    this.io = io;
  }

  exists(user1, user2) {
    return this.chats
      .filter(x => x.uniqueId.includes(user1))
      .find(x => x.uniqueId.includes(user2));
  }

  addChat(user1, user2) {
    const alreadyExists = this.exists(user1, user2);
    const newChat = new Chat(user1, user2);
    if (!alreadyExists) {
      this.chats.push(newChat);
    }
    return {
      success: true,
      result: alreadyExists ? alreadyExists : newChat
    };
  }

  getRecentChats(userId) {
    return {
      success: true,
      result: this.chats
        .filter(x => x.uniqueId.includes(userId))
        .map(chat =>
          new RecentChatModel(
            chat.id,
            chat.getName(userId),
            chat.lastMessage,
            userChatRepo.getLastReadMessageId(userId, chat.Id)
          )
        )
    }
  }

  loadChat(chatId, userId, lastLoadedMessageId) {
    const selectedChat = this.chats.find(x => x.id === chatId);
    const { messages } = selectedChat || { message: [] };
    const index = messages.findIndex(x => x.id === lastLoadedMessageId);

    if (messages.length === 0 || (index === -1 && !!lastLoadedMessageId)) {
      return {
        success: true,
        result: []
      }
    }
    let i = index === -1 ? 0 : index;
    return {
      success: true,
      result: {
        id: chatId,
        peer: {
          id: selectedChat.getPeerId(userId),
          name: selectedChat.getName(userId)
        },
        messages: [...messages].reverse().slice(i,
          (i + PAGE_SIZE) > messages.length ? undefined : (i + PAGE_SIZE))
      }
    }
  }

  submitTextMessage(chatId, message, userId) {
    const chat = this.chats.find(x => x.id === chatId);
    if (!chat) {
      return {
        success: false,
        error: 'Chat not found.'
      }
    }
    const data = chat.submitTextMessage(userId, message);

    const pushMessage = peerId =>
      userConnectionsRepo
        .getUserConnections(chat.getPeerId(peerId))
        .forEach(connectionId =>
          this.io.to(connectionId).emit('new-message', { chatId, message: data }));

    pushMessage(userId);
    pushMessage(chat.getPeerId(userId));

    return {
      success: true,
      result: data
    };
  }
}

module.exports = new ChatRepository();