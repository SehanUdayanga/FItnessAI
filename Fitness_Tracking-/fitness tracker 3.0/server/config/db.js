const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fittrack';
  const isAtlas = mongoUri.includes('mongodb+srv') || mongoUri.includes('mongodb.net');
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: isAtlas ? 10000 : 3000
    });
    console.log(`✅ MongoDB Connected (${isAtlas ? 'Atlas Cloud' : 'Local'}): ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (isAtlas) {
      console.warn(`\n⚠️  Could not connect to MongoDB Atlas (${error.message}).`);
      console.warn(`💡 Tip: Make sure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> 0.0.0.0/0) and credentials are correct.\n`);
    } else {
      console.log(`\n⚠️  Local MongoDB not detected on 127.0.0.1:27017 (${error.message}).`);
    }
    console.log(`⚡ Launching In-Memory MongoDB Server fallback for seamless offline operation...\n`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`⚠️ In-Memory MongoDB Connected (RAM only - changes will NOT be saved to Atlas cloud): ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`❌ MongoDB Connection Failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
