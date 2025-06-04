import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const uri = process.env.MONGODB_URI;
    console.log('Connection URI:', uri?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    // Connect with explicit database name
    await mongoose.connect(uri || '', {
      dbName: 'trichygold-order',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('\nSuccessfully connected to MongoDB!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

  } catch (error: any) {
    console.error('\nMongoDB connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error code name:', error.codeName);
    
    if (error.code === 8000) {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. Username and password in your .env file');
      console.error('2. User exists in MongoDB Atlas');
      console.error('3. User has correct permissions');
      console.error('4. IP address is whitelisted in MongoDB Atlas');
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  }
};

// Run the test
testConnection(); 