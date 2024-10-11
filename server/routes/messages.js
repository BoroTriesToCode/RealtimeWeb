const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const redisClient = require('../config/redis');

// Get messages between two users
router.get('/:chatRoomId', async (req, res) => {
  const { chatRoomId } = req.params;
  const cacheKey = `messages:${chatRoomId}`;

  try {
    // Check the cache
    const cachedMessages = await redisClient.get(cacheKey);
    if (cachedMessages) {
      console.log(`Cache hit for chatRoomId: ${chatRoomId}`);
      return res.json(JSON.parse(cachedMessages));
    }

    // If not in cache, get from database
    console.log(`Cache miss for chatRoomId: ${chatRoomId}. Fetching from MongoDB.`);
    const messages = await Message.find({ chatRoomId }).sort({ timestamp: 1 });

    // Cache expiration time - 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(messages));

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
