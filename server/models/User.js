const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  age: Number,
  country: String,
  languageLevel: String,
  bio: String,
  points: { type: Number, default: 0 },
  friends: [{ type: String }],
  friendRequestsReceived: [{ from: String }],
  friendRequestsSent: [{ to: String }]
});

module.exports = mongoose.model('User', UserSchema);
