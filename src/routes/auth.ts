import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import { auth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Login attempt for username:', req.body.username);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find employee by username
    const employee = await Employee.findOne({ username });
    if (!employee) {
      console.log('Employee not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      // Use a default secret in development only, not for production
      process.env.JWT_SECRET = 'trichygold-dev-temporary-secret-key';
      console.warn('Using default JWT_SECRET - this is not secure for production');
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: employee._id,
        role: employee.role,
        name: employee.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful for user:', username);

    res.json({
      token,
      user: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        isAdmin: employee.role === 'admin'
      }
    });
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new employee (admin only)
router.post('/register', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Register attempt by user:', req.user?.id);

    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to register:', req.user?.id);
      return res.status(403).json({ message: 'Only admins can register new employees' });
    }

    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      console.log('Missing required fields in registration');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ username });
    if (existingEmployee) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Employee with this username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const employee = new Employee({
      name,
      username,
      password: hashedPassword,
      role: 'employee'
    });

    await employee.save();
    console.log('New employee registered:', username);

    res.status(201).json({
      message: 'Employee registered successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        role: employee.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all employees (admin only)
router.get('/employees', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Fetching all employees for admin user:', req.user?.id);

    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to fetch employees:', req.user?.id);
      return res.status(403).json({ message: 'Only admins can view employees' });
    }

    // Fetch all employees, excluding the password field for security
    const employees = await Employee.find({}).select('-password');

    console.log(`Found ${employees.length} employees.`);
    res.json({ employees });
  } catch (error: any) {
    console.error('Error fetching employees:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 