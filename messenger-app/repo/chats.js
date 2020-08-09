const PAGE_SIZE = 10;
const userRepo = require('./users');
const userChatRepo = require('./userChat');
const { v4 } = require('uuid');

class ChatMessage {
  constructor(content, date, type, userId) {
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
    return this.messages.length > 0 ? this.lastMessage[-1] : null;
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

  exists(user1, user2) {
    return this.chats
      .filter(x => x.uniqueId.includes(user1))
      .find(x => x.uniqueId.includes(user2));
  }

  addChat(user1, user2) {
    return {
      success: true,
      result: this.exists(user1, user2) || new Chat(user1, user2)
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
            chat.getName(),
            chat.lastMessage,
            userChatRepo.getLastReadMessageId(userId, chat.Id)
          )
        )
    }
  }

  loadChat(chatId, userId, lastLoadedMessageId) {
    const selectedChat = this.chats.find(x => x.id === chatId);
    const { messages } = selectedChat|| { message: [] };
    const index = messages.findIndex(x => x.id === lastLoadedMessageId);

    if (messages.length === 0 || (index === -1 && !!lastLoadedMessageId)) {
      return {
        success: true,
        result: []
      }
    }

    return {
      success: true,
      result: {
        id: chatId,
        peer: {
          id: selectedChat.getPeerId(userId),
          name: selectedChat.getName(userId)
        },
        messages: messages.slice(index, (index + PAGE_SIZE) < messages.length ? undefined : (index + PAGE_SIZE))
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
    return {
      success: true,
      result: chat.submitTextMessage(userId, message)
    };
  }
}

module.exports = new ChatRepository();