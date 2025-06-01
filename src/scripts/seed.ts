import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    console.log('Attempting to connect to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'trichygold-order' // Explicitly set database name
    });
    console.log('Connected to MongoDB for seeding successfully, using database:', mongoose.connection.name);

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists in this database');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Track123', 10);
    const admin = new Employee({
      username: 'admin',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully in database:', mongoose.connection.name);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 