const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  chineseCharacter: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  topic: { type: String, required: true },
  level: { type: String, required: true }
});

module.exports = mongoose.model('Word', WordSchema);
