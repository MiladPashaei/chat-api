const users = require('../repo/users');
const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.json(users.getAll());
});

router.post('/user', function (req, res) {
  const { name } = req.body;
  res.json(users.add(name));
});

module.exports = router;
