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

// Health check endpoint - must be first
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  try {
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'trichygold-order'
    });
    console.log('Connected to MongoDB successfully');

    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Start server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      console.log('Health check available at /health');
    });

  } catch (error: any) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer(); 