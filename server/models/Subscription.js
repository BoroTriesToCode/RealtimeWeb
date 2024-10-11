const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  username: { type: String, required: true },
  topicKeyword: { type: String, required: true }, 
  points: { type: Number, default: 0 }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
