const mongoose = require('mongoose');
const Word = require('./models/Word');
const Question = require('./models/Question');
require('dotenv').config(); // To load environment variables from a .env file

const words = [
  { "chineseCharacter": "猫", "pinyin": "māo", "english": "cat", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "狗", "pinyin": "gǒu", "english": "dog", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "鸟", "pinyin": "niǎo", "english": "bird", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "鱼", "pinyin": "yú", "english": "fish", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "马", "pinyin": "mǎ", "english": "horse", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "牛", "pinyin": "niú", "english": "cow", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "羊", "pinyin": "yáng", "english": "sheep", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "猪", "pinyin": "zhū", "english": "pig", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "鸡", "pinyin": "jī", "english": "chicken", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "鸭", "pinyin": "yā", "english": "duck", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "龙", "pinyin": "lóng", "english": "dragon", "topic": "random", "level": "HSK1" },
  { "chineseCharacter": "狮子", "pinyin": "shīzi", "english": "lion", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "老虎", "pinyin": "lǎohǔ", "english": "tiger", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "熊", "pinyin": "xióng", "english": "bear", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "猴子", "pinyin": "hóuzi", "english": "monkey", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "兔子", "pinyin": "tùzi", "english": "rabbit", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "蛇", "pinyin": "shé", "english": "snake", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "大象", "pinyin": "dàxiàng", "english": "elephant", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "蝴蝶", "pinyin": "húdié", "english": "butterfly", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "蚂蚁", "pinyin": "mǎyǐ", "english": "ant", "topic": "random", "level": "HSK2" },
  { "chineseCharacter": "企鹅", "pinyin": "qǐ'é", "english": "penguin", "topic": "random", "level": "HSK3" },
  { "chineseCharacter": "袋鼠", "pinyin": "dàishǔ", "english": "kangaroo", "topic": "random", "level": "HSK3" },
  { "chineseCharacter": "鲸鱼", "pinyin": "jīngyú", "english": "whale", "topic": "random", "level": "HSK3" },
  { "chineseCharacter": "乌龟", "pinyin": "wūguī", "english": "turtle", "topic": "random", "level": "HSK3" },
  { "chineseCharacter": "青蛙", "pinyin": "qīngwā", "english": "frog", "topic": "random", "level": "HSK3" },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const savedWords = await Word.insertMany(words);
    
    const questions = savedWords.map(word => ({
      word: word._id,
      topic: word.topic,
      level: word.level
    }));

    await Question.insertMany(questions);

    console.log("Data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
