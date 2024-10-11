require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {  
    await mongoose.connect(process.env.MONGO_URI);    
    console.log('Connected to MongoDB');
    await User.init();
    console.log('Indexes ensured');
  } catch (err) {
    console.error('MongoDB connection error:', err.message); 
    console.error('Full error object:', err);  
    process.exit(1);
  }
};

module.exports = connectDB;
