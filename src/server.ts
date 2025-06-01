import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import net from 'net';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Log environment variables (without sensitive data)
console.log('Environment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5000);
console.log('MongoDB URI:', process.env.MONGO_URI ? 'Configured' : 'Not configured');

// Middleware
app.use(cors());
app.use(express.json());

// Detailed request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Path: ${req.path}`);
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for unmatched routes
app.use((req, res, next) => {
  console.warn(`${new Date().toISOString()} - 404 Not Found for: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Not Found - This route does not exist.' });
});

// Function to check if port is in use
const isPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    
    server.on('error', () => {
      resolve(true);
    });
    
    server.listen(port, () => {
      server.close(() => {
        resolve(false);
      });
    });
  });
};

// Function to find an available port
const findAvailablePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'trichygold-order' // Explicitly set database name
    });
    console.log('Connected to MongoDB successfully');
    console.log('Using database:', mongoose.connection.name); // Log the database name

    // Find an available port
    const startPort = parseInt(process.env.PORT || '5000');
    const port = await findAvailablePort(startPort);
    
    // Start server
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Available routes:');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/register');
      console.log('- GET /api/orders');
      console.log('- POST /api/orders');
    });

    // Handle server errors
    server.on('error', (err: any) => {
      console.error('Server error:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error: any) {
    console.error('Startup error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  // Give time for logging before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Give time for logging before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Start the server
startServer(); 