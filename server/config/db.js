const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log(`[Database] Attempting connection to configured MongoDB URI...`);
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
        console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
        return;
      } catch (err) {
        console.warn(`[Database] Could not connect to configured MONGODB_URI: ${err.message}`);
        console.log(`[Database] Falling back to embedded MongoDB instance...`);
      }
    }

    // Try MongoDB Memory Server for zero-friction local run
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      console.log(`[Database] Initializing embedded MongoDB server at ${inMemoryUri}...`);
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB.`);
    } catch (memErr) {
      console.error(`[Database] Embedded MongoDB failed: ${memErr.message}`);
      // Fallback try local default
      await mongoose.connect('mongodb://127.0.0.1:27017/interviewforge', { serverSelectionTimeoutMS: 3000 });
      console.log(`[Database] Connected to local MongoDB instance.`);
    }
  } catch (error) {
    console.error(`[Database] Critical Connection Failure: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error(`[Database] Error during disconnection:`, err);
  }
};

module.exports = { connectDB, disconnectDB };
