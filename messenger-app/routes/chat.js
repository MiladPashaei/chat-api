const chats = require('../repo/chat');
const express = require('express');
const router = express.Router();

router.get('/recent/user/:userId', function (req, res, next) {
  const { userId } = req.route;
  res.json(chats.getRecentChats(userId));
});

router.get('/load/:id/user/:userId/message/messageId', function (req, res) {
  const { id, userId, messageId } = req.route;
  res.json(chats.loadChat(id, userId, messageId));
});

router.post('/submit/user/:userId', function (req, res) {
  const { userId } = req.route;
  const { chatId, message } = req.body;
  res.json(chats.submitTextMessage(chatId, message, userId));
});

router.post('/start/user/:userId', function (req, res) {
  const { userId: user1 } = req.route;
  const { userId: user2 } = req.body;
  res.json(chats.addChat(user1, user2));
});


module.exports = router;
