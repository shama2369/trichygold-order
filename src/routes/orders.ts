import express from 'express';
import { Order } from '../models/Order';
import { auth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Define item types
type ItemName = 'Karak Tea' | 'Milk Tea' | 'Coffee' | 'Rani' | 'Soft Drinks' | 'Fresh Juice' | 'Sandwich' | 'Shawarma';

interface OrderItem {
  name: ItemName;
  quantity: number;
}

interface OrderItems {
  'Karak Tea': number;
  'Milk Tea': number;
  'Coffee': number;
  'Rani': number;
  'Soft Drinks': number;
  'Fresh Juice': number;
  'Sandwich': number;
  'Shawarma': number;
}

// Get summary of all orders (for admin)
router.get('/summary', auth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Summary route: Checking user role:', req.user?.role);
    if (req.user.role !== 'admin') {
      console.log('Summary route: Access denied - not admin');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { month, year, shop } = req.query;
    console.log('Summary route: Received query params:', { month, year, shop });
    
    if (!month || !year) {
      console.log('Summary route: Missing required params');
      return res.status(400).json({ message: 'Month and year are required' });
    }

    console.log(`Summary route: Fetching orders for month ${month}, year ${year}${shop ? `, shop ${shop}` : ' across all shops'}`);
    
    const query: any = {
      month: parseInt(month as string),
      year: parseInt(year as string),
    };

    // Add shop to query if specified
    if (shop) {
      query.shop = shop;
    }

    console.log('Summary route: Using query:', query);

    // If shop is specified, find all orders for that specific shop
    if (shop) {
      const orders = await Order.find(query);
      console.log(`Summary route: Found ${orders.length} orders for specific shop`);

      const aggregatedItems: OrderItems = {
        'Karak Tea': 0,
        'Milk Tea': 0,
        'Coffee': 0,
        'Rani': 0,
        'Soft Drinks': 0,
        'Fresh Juice': 0,
        'Sandwich': 0,
        'Shawarma': 0
      };

      if (orders.length > 0) {
        orders.forEach(order => {
          if (order.items) {
            const orderItems = order.items as OrderItems;
            Object.keys(orderItems).forEach(itemName => {
              if (aggregatedItems.hasOwnProperty(itemName)) {
                aggregatedItems[itemName as ItemName] += orderItems[itemName as ItemName];
              } else {
                // Handle unexpected item names if necessary
                console.warn(`Summary route: Unexpected item name encountered: ${itemName}`);
              }
            });
          }
        });
        console.log(`Summary route: Aggregated items for specific shop:`, aggregatedItems);
        return res.json({ items: aggregatedItems });
      }
      console.log('Summary route: No orders found for specific shop');
      return res.json({ items: {} });
    }

    // If no shop specified, find all orders and aggregate
    const orders = await Order.find(query);
    console.log(`Summary route: Found ${orders.length} orders for aggregation`);

    const aggregatedItems: OrderItems = {
      'Karak Tea': 0,
      'Milk Tea': 0,
      'Coffee': 0,
      'Rani': 0,
      'Soft Drinks': 0,
      'Fresh Juice': 0,
      'Sandwich': 0,
      'Shawarma': 0
    };

    if (orders.length > 0) {
      orders.forEach(order => {
        if (order.items) {
          const orderItems = order.items as OrderItems;
          Object.keys(orderItems).forEach(itemName => {
            if (aggregatedItems.hasOwnProperty(itemName)) {
              aggregatedItems[itemName as ItemName] += orderItems[itemName as ItemName];
            } else {
               // Handle unexpected item names if necessary
                console.warn(`Summary route: Unexpected item name encountered: ${itemName}`);
            }
          });
        }
      });
      console.log(`Summary route: Aggregated items across all shops:`, aggregatedItems);
      res.json({ items: aggregatedItems });
    } else {
      console.log('Summary route: No orders found for aggregation');
      res.json({ items: {} });
    }

  } catch (error: any) {
    console.error('Summary route: Error fetching orders summary:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      details: error.message 
    });
  }
});

// Get orders (for employee's current month or admin's selected employee/month/year)
router.get('/', auth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('GET /api/orders: Received request');
    console.log('GET /api/orders: User:', req.user?.id, 'Role:', req.user?.role);
    console.log('GET /api/orders: Query params:', req.query);

    const { employeeId, month, year, shop } = req.query; // Get query parameters including shop
    
    if (req.user.role === 'admin' && employeeId && month && year) {
      // Admin requesting specific employee's summary for month/year
      console.log(`GET /api/orders: Admin fetching order summary for employee ${employeeId}, month ${month}, year ${year}${shop ? `, shop ${shop}` : ' across all shops'}`);
      
      const query: any = {
        employeeId: employeeId as string,
        month: parseInt(month as string),
        year: parseInt(year as string),
      };

      // Add shop to query if specified
      if (shop) {
        query.shop = shop;
      }
      console.log('GET /api/orders: Admin query:', query);

      // If shop is specified, find one order document for that specific shop
      if (shop) {
        const order = await Order.findOne(query);
        console.log(`GET /api/orders: Found order for specific shop:`, order ? order._id : 'None');
        return res.json(order || { items: {} });
      }

      // If no shop specified, find all orders and aggregate
      const orders = await Order.find(query);
      console.log(`GET /api/orders: Found ${orders.length} orders for aggregation`);

      const aggregatedItems: OrderItems = {
        'Karak Tea': 0,
        'Milk Tea': 0,
        'Coffee': 0,
        'Rani': 0,
        'Soft Drinks': 0,
        'Fresh Juice': 0,
        'Sandwich': 0,
        'Shawarma': 0
      };

      if (orders.length > 0) {
        orders.forEach(order => {
          // Ensure order.items is not null or undefined before iterating
          if (order.items) {
            const orderItems = order.items as OrderItems; // Cast to the specific type
            Object.keys(orderItems).forEach(itemName => {
               // Ensure itemName is one of the expected ItemName literals before using it as an index
              if (aggregatedItems.hasOwnProperty(itemName)) {
                 aggregatedItems[itemName as ItemName] += orderItems[itemName as ItemName];
              }
            });
          }
        });
        console.log(`GET /api/orders: Aggregated items:`, aggregatedItems);
        res.json({ items: aggregatedItems }); // Return aggregated items in an object
      } else {
        console.log(`GET /api/orders: No orders found for aggregation.`);
        res.json({ items: {} }); // Return an empty items object if no orders found
      }

    } else if (req.user?.id) {
      // Regular employee or admin without specific query params requesting their current month's order
      console.log(`GET /api/orders: Fetching current month order for employee ${req.user.id}`);
      const currentDate = new Date();
      const query: any = {};
      query.employeeId = req.user.id;
      query.month = currentDate.getMonth() + 1;
      query.year = currentDate.getFullYear();

      console.log('GET /api/orders: Employee query:', query);
      
      // For regular employee, still find one based on their ID, current month/year, and default shop
      const order = await Order.findOne(query);

      console.log(`GET /api/orders: Query result for employee view: ${order ? 'Found order' : 'No order found'}`);
      // For employee view, return the single order document or null
      res.json(order);

    } else {
       // Should not happen with auth middleware, but as a fallback
       console.log('GET /api/orders: User ID is missing');
       return res.status(400).json({ message: 'User ID is required' });
    }

  } catch (error: any) {
    console.error('GET /api/orders: Error fetching orders:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order (by ID - potentially for future use or other purposes)
// Keep this route separate if needed for fetching orders by their document _id
// router.get('/:id', auth, async (req: AuthenticatedRequest, res) => { ... });

// Create new order
router.post('/', auth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Creating/updating order for user:', req.user?.id);
    console.log('Request body:', req.body);
    
    const { items, shop = 'restaurant1' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Items array is required and must not be empty');
      return res.status(400).json({ message: 'Items array is required and must not be empty' });
    }

    if (!req.user?.id) {
      console.log('User ID is missing');
      return res.status(400).json({ message: 'User ID is required' });
    }

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Find existing order for this month or create new one
    let order = await Order.findOne({
      employeeId: req.user.id,
      shop,
      month,
      year
    });

    const defaultItems: OrderItems = {
      'Karak Tea': 0,
      'Milk Tea': 0,
      'Coffee': 0,
      'Rani': 0,
      'Soft Drinks': 0,
      'Fresh Juice': 0,
      'Sandwich': 0,
      'Shawarma': 0
    };

    if (!order) {
      // Create new order if none exists
      order = new Order({
        employeeId: req.user.id,
        createdBy: req.user.id,
        shop,
        month,
        year,
        items: defaultItems
      });
    }

    // Ensure order.items exists and has the correct type
    const orderItems = (order.items || defaultItems) as OrderItems;

    // Update item counts
    items.forEach((item: OrderItem) => {
      if (item.name in orderItems) {
        orderItems[item.name] += item.quantity;
      }
    });

    // Update the order with the new items
    order.items = orderItems;

    await order.save();
    console.log('Order updated successfully:', order._id);
    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error updating order:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    res.status(500).json({ 
      message: 'Server error',
      details: error.message 
    });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Updating order status:', req.params.id);
    
    const { status } = req.body;
    if (!status) {
      console.log('Status is required');
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    console.log('Order status updated:', req.params.id);
    res.json(order);
  } catch (error: any) {
    console.error('Error updating order:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', auth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Deleting order:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    console.log('Order deleted successfully:', req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 