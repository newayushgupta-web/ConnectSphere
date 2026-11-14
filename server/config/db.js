const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no URI is provided, use MongoMemoryServer for instant zero-config dev/test
    if (!mongoUri || mongoUri.trim() === '') {
      console.log('No MONGODB_URI provided. Initializing in-memory MongoDB instance for local dev/testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      mongoUri = mongodInstance.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
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
