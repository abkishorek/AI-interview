const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const seedDatabase = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Auto-seed demo content and question bank
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` InterviewForge AI Server`);
      console.log(` Status: Running`);
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
      console.log(`====================================================`);
    });

    const handleShutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Closed connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error('[Server Startup Failure]', error);
    process.exit(1);
  }
};

startServer();
