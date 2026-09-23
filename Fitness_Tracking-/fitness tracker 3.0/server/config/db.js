const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fittrack';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // fail fast if local MongoDB daemon is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`\n⚠️  Local MongoDB not detected on 127.0.0.1:27017 (${error.message}).`);
    console.log(`⚡ Launching In-Memory MongoDB Server fallback for instant testing...\n`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`❌ MongoDB Connection Failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
