const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const Subscription = require('../models/Subscription');

const router = express.Router();

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'leaderboardUpdates';

let channel = null;

// Connect to RabbitMQ
amqp.connect(RABBITMQ_URL, (err, connection) => {
  if (err) {
    console.error('RabbitMQ connection error:', err);
    throw err;
  }

  connection.createChannel((err, ch) => {
    if (err) {
      console.error('RabbitMQ channel error:', err);
      throw err;
    }

    channel = ch;
    channel.assertQueue(QUEUE_NAME, {
      durable: false,
    });

    console.log(`RabbitMQ connected and channel created: ${QUEUE_NAME}`);
  });
});

// Function to publish message to RabbitMQ
const publishToQueue = (message) => {
  if (channel) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
    console.log('Message published to RabbitMQ:', message);
  } else {
    console.error('RabbitMQ channel is not available');
  }
};

// Update points for a subscription
router.put('/:username/:keyword', async (req, res) => {
  const { username, keyword } = req.params;
  const { points } = req.body;

  console.log(`Updating subscription for user: ${username}, topic keyword: ${keyword}, points: ${points}`);

  try {
    const subscription = await Subscription.findOneAndUpdate(
      { username, topicKeyword: keyword },
      { $set: { points } },
      { new: true }
    );

    if (!subscription) {
      console.error('Subscription not found');
      return res.status(404).json({ error: 'Subscription not found' });
    }

    console.log('Subscription updated successfully:', subscription);

    // Emit update to RabbitMQ
    publishToQueue({ username, keyword, points });

    res.json(subscription);
  } catch (err) {
    console.error('Error updating subscription:', err);
    res.status(500).json({ error: err.message });
  }
});


// Create a new subscription
router.post('/', async (req, res) => {
  const { username, topicKeyword } = req.body;
  console.log('Creating new subscription:', req.body); 
  try {
    if (!username || !topicKeyword) {
      console.error('Missing username or topicKeyword');
      return res.status(400).json({ error: 'Username and topicKeyword are required' });
    }
    const newSubscription = new Subscription({ username, topicKeyword });
    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (err) {
    console.error('Error creating subscription:', err.message); 
    res.status(400).json({ error: err.message });
  }
});



// Get subscriptions for a user
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const subscriptions = await Subscription.find({ username });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific subscription for a user and topic keyword
router.get('/:username/:keyword', async (req, res) => {
  const { username, keyword } = req.params;
  try {
    const subscription = await Subscription.findOne({ username, topicKeyword: keyword });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user subscription
router.delete('/:username/:keyword', async (req, res) => {
  const { username, keyword } = req.params;
  console.log(`Unsubscribing user: ${username} from topic: ${keyword}`);

  try {
    const result = await Subscription.findOneAndDelete({ username, topicKeyword: keyword });
    if (!result) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Emit event to remove user from leaderboards
    const message = { username, topicKeyword: keyword, action: 'delete' };
    req.io.emit('removeUserFromLeaderboard', message);
    publishToQueue(message);

    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('Error unsubscribing:', err);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});



module.exports = router;
