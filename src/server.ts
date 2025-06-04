import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint and status tracking
let isMongoConnected = false;
let serverStartTime = new Date();

app.get('/health', (req, res) => {
  // Return 200 even if MongoDB isn't connected yet
  // This prevents Railway from killing the container while MongoDB is connecting
  res.status(200).json({ 
    status: 'ok',
    mongo: isMongoConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    startTime: serverStartTime
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Catch-all for unmatched routes
app.use((req, res, next) => {
  console.warn(`${new Date().toISOString()} - 404 Not Found for: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Not Found - This route does not exist.' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Start server first so health checks can pass
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log('Health check available at /health');
  });

  // Then try to connect to MongoDB
  try {
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      console.error('MONGO_URI is not defined in environment variables');
      return;
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'trichygold-order'
    });
    console.log('Connected to MongoDB successfully');
    isMongoConnected = true;

  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    // Don't exit process, just log the error
    // The app can still serve static files without MongoDB
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Only exit for truly fatal errors
  if (err.message.includes('EADDRINUSE') || err.message.includes('EACCES')) {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log but don't exit
});

// Start the server
startServer();