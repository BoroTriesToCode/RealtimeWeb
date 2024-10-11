const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Word = require('../models/Word');
const redisClient = require('../config/redis');

// Get all topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all words from topic
router.get('/:keyword/words', async (req, res) => {
  const { keyword } = req.params;
  console.log(`Received request for keyword: ${keyword}`);
  
  try {
    // Check cache
    const cacheKey = `words:${keyword}`;
    const cachedWords = await redisClient.get(cacheKey);
    
    if (cachedWords) {
      console.log(`Cache hit for keyword: ${keyword}`);
      return res.json(JSON.parse(cachedWords));
    }

    console.log(`Cache miss for keyword: ${keyword}. Fetching from MongoDB.`);
    const words = await Word.find({ topic: keyword }).sort({ pinyin: 1 });

    console.log(`Found words for keyword "${keyword}": ${words.length} items`);
    
    // Store in cache
    await redisClient.set(cacheKey, JSON.stringify(words), {
      EX: 3600 
    });

    res.json(words);
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get all detail of topic
router.get('/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const topicData = await Topic.findOne({ keyword: keyword });
    res.json(topicData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
