const chats = require('../repo/chats');
const express = require('express');
const router = express.Router();

router.get('/recent/user/:userId', function (req, res, next) {
  const { userId } = req.params;
  res.json(chats.getRecentChats(userId));
});

router.get('/load/:id/user/:userId/', function (req, res) {
  const { id, userId } = req.params;
  const { messageId } = req.query;
  res.json(chats.loadChat(id, userId, messageId));
});

router.post('/submit/user/:userId', function (req, res) {
  const { userId } = req.params;
  const { chatId, message } = req.body;
  res.json(chats.submitTextMessage(chatId, message, userId));
});

router.post('/start/user', function (req, res) {
  const { 
    peer1: user1,
    peer2: user2 
  } = req.body;
  res.json(chats.addChat(user1, user2));
});


module.exports = router;
