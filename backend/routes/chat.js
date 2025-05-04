const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { verifyToken } = require('./auth'); // If you want to protect routes for logged-in users

// Save a chat message
router.post('/', async (req, res) => {
  try {
    const { userId, sessionId, message, isUser } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    const chat = new Chat({ userId, sessionId, message, isUser });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

// Get all chat messages for a session (or user)
router.get('/', async (req, res) => {
  try {
    const { sessionId, userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (sessionId) query.sessionId = sessionId;
    const chats = await Chat.find(query).sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router; 