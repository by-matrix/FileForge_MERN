const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected successfully ');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // exit on failure
  }
};

module.exports = connectDB;