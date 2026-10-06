const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medilog-edge';

  try {
    mongoose.set('strictQuery', false);
    // Try connecting with a 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB at: ${uri.replace(/\/\/.*@/, '//***@')}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB URI (${err.message}).`);
    console.log('[Database] Attempting fallback to in-memory MongoDB for local development/testing...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB started successfully at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start in-memory MongoDB fallback:', memErr.message);
      console.error('[Database] Please ensure MongoDB is running or specify a valid MONGODB_URI.');
      throw err;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
