const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no URI is provided, use MongoMemoryServer
    if (!mongoUri || mongoUri.trim() === '') {
      const isTestEnv = process.env.NODE_ENV === 'test';
      const { MongoMemoryServer } = require('mongodb-memory-server');

      if (isTestEnv) {
        // Ephemeral in-memory for unit test isolation
        mongodInstance = await MongoMemoryServer.create();
      } else {
        // Persistent embedded database in development so data survives restarts!
        const dbPath = path.join(__dirname, '..', '.mongo-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }
        console.log(`Using persistent local database storage at: ${dbPath}`);
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbPath,
            storageEngine: 'wiredTiger',
          },
        });
      }

      mongoUri = mongodInstance.getUri();
      console.log(`Local MongoDB started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If external URI failed in development, try fallback to memory server
    if (process.env.NODE_ENV !== 'production' && !mongodInstance) {
      console.log('Attempting fallback to in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const fallbackUri = mongodInstance.getUri();
        const conn = await mongoose.connect(fallbackUri, { autoIndex: true });
        console.log(`Fallback in-memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`Fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
