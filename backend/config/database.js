const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    console.error('\n❌ MONGODB_URI is missing. Set it in backend/.env (see .env.example).\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri.trim());
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
