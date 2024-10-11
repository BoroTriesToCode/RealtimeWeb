const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// List all users
router.get('/', async (req, res) => {
  console.log('Fetching all users');
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, age, country, languageLevel, bio, name } = req.body;
  console.log('Registering new user:', username);
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword, age, country, languageLevel, bio, name });
    await newUser.save();
    console.log('User registered successfully:', username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err.message);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Username is already taken' });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('User login attempt:', username);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn('Invalid credentials: user not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('Invalid credentials: incorrect password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', username);
    res.status(200).json({ message: 'User logged in' });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/:username', async (req, res) => {
  console.log('Fetching profile for user:', req.params.username);
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      console.warn('User not found:', req.params.username);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/:username', async (req, res) => {
  const { age, country, languageLevel, bio, points } = req.body;
  console.log('Updating profile for user:', req.params.username);
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { age, country, languageLevel, bio, points },
      { new: true }
    );
    if (!user) {
      console.warn('User not found:', req.params.username);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Profile updated successfully:', req.params.username);
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete user profile
router.delete('/:username', async (req, res) => {
  console.log('Deleting profile for user:', req.params.username);
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (!user) {
      console.warn('User not found:', req.params.username);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Profile deleted successfully:', req.params.username);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get received friend requests for a user
router.get('/:username/friend-requests/received', async (req, res) => {
  console.log('Fetching friend requests received for user:', req.params.username);
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      console.warn('User not found for fetching received friend requests:', req.params.username);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.friendRequestsReceived);
  } catch (err) {
    console.error('Error fetching friend requests received:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get sent friend requests for a user
router.get('/:username/friend-requests/sent', async (req, res) => {
  console.log('Fetching friend requests sent for user:', req.params.username);
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      console.warn('User not found for fetching sent friend requests:', req.params.username);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.friendRequestsSent);
  } catch (err) {
    console.error('Error fetching friend requests sent:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Accept a friend request
router.put('/:username/friend-requests/:fromUser', async (req, res) => {
  const { fromUser } = req.params;
  try {
    const receiver = await User.findOne({ username: req.params.username });
    const sender = await User.findOne({ username: fromUser });

    if (!receiver || !sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    receiver.friends.push(fromUser);
    sender.friends.push(req.params.username);

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(request => request.from !== fromUser);
    sender.friendRequestsSent = sender.friendRequestsSent.filter(request => request.to !== req.params.username);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request accepted' });
    req.io.emit('friendRequestAccepted', { fromUser, toUser: req.params.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel or decline a friend request
router.delete('/:username/friend-requests/:fromUser', async (req, res) => {
  const { fromUser, username } = req.params;
  console.log(`Cancelling friend request from ${fromUser} to ${username}`);
  try {
    const receiver = await User.findOne({ username });
    const sender = await User.findOne({ username: fromUser });

    if (!receiver || !sender) {
      console.warn('User not found for cancelling friend request:', { fromUser, username });
      return res.status(404).json({ error: 'User not found' });
    }

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(request => request.from !== fromUser);
    sender.friendRequestsSent = sender.friendRequestsSent.filter(request => request.to !== username);

    await receiver.save();
    await sender.save();

    console.log(`Friend request cancelled from ${fromUser} to ${username}`);
    req.io.emit('friendRequestCancelled', { fromUser, toUser: username });
    res.status(200).json({ message: 'Friend request cancelled' });
  } catch (err) {
    console.error('Error cancelling friend request:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Send a friend request
router.post('/:username/friend-requests', async (req, res) => {
  const { toUser } = req.body;
  const { username } = req.params;

  try {
    const sender = await User.findOne({ username });
    const receiver = await User.findOne({ username: toUser });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to sender's sent requests
    if (!sender.friendRequestsSent.some(request => request.to === toUser)) {
      sender.friendRequestsSent.push({ to: toUser });
    }

    // Add to receiver's received requests
    if (!receiver.friendRequestsReceived.some(request => request.from === username)) {
      receiver.friendRequestsReceived.push({ from: username });
    }

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Error sending friend request:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Delete a friend
router.delete('/:username/friends/:friendUsername', async (req, res) => {
  const { username, friendUsername } = req.params;
  try {
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.friends = user.friends.filter(friend => friend !== friendUsername);
    friend.friends = friend.friends.filter(friend => friend !== username);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend deleted' });
    req.io.emit('friendDeleted', { username, friendUsername });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get friends of a user
router.get('/:username/friends', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select('friends');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.friends);
  } catch (err) {
    res.status500.json({ error: err.message });
  }
});

// Fetch subscriptions for a user
router.get('/:username/subscriptions', async (req, res) => {
  const { username } = req.params;
  console.log(`Fetching subscriptions for username: ${username}`);
  try {
    const subscriptions = await Subscription.find({ username });
    console.log(`Found subscriptions: ${subscriptions.length}`);
    res.json(subscriptions);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
