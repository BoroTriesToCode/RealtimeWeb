const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

router.get('/:keyword', async (req, res) => {
  const { keyword } = req.params;
  try {
    const leaderboard = await Subscription.find({ topicKeyword: keyword })
      .sort({ points: -1 })
      .limit(10); 
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
