const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
