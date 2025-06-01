import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: {
    'Karak Tea': { type: Number, default: 0 },
    'Milk Tea': { type: Number, default: 0 },
    'Coffee': { type: Number, default: 0 },
    'Rani': { type: Number, default: 0 },
    'Soft Drinks': { type: Number, default: 0 },
    'Fresh Juice': { type: Number, default: 0 },
    'Sandwich': { type: Number, default: 0 },
    'Shawarma': { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  shop: {
    type: String,
    required: true,
    enum: ['restaurant1', 'restaurant2'],
    default: 'restaurant1'
  },
  month: {
    type: Number,
    required: true,
    default: () => new Date().getMonth() + 1
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true,
});

// Create a compound index for employee, shop, month, and year
orderSchema.index({ employeeId: 1, shop: 1, month: 1, year: 1 }, { unique: true });

export const Order = mongoose.model('Order', orderSchema); 