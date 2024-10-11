const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  keyword:{ type: String, required: true, unique: true}
});

module.exports = mongoose.model('Topic', TopicSchema);
