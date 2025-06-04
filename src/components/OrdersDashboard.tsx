import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { orderService } from '../services/api';
import { authService } from '../services/api';
import OrderForm from './OrderForm';
import { useNavigate } from 'react-router-dom';

interface Order {
  _id: string;
  items: {
    [key: string]: number; // Adjusted type to match backend structure
  };
  createdAt: string;
  shop: string; // Add shop to the interface
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    console.log('OrdersDashboard: Fetching orders...');
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getOrders();
      console.log('OrdersDashboard: Fetched orders:', data);

      let ordersArray: Order[] = [];
      if (data) {
        // Check if the data is a single object (for employee view) or an array (potentially for admin view)
        if (Array.isArray(data)) {
          ordersArray = data;
        } else if (typeof data === 'object') {
          // If it's a single object, put it in an array
          ordersArray = [data];
        } else {
           console.warn('OrdersDashboard: Unexpected data format from API', data);
           setError('Received unexpected data format from server.');
        }
      }

      console.log('OrdersDashboard: Processed orders array:', ordersArray);

      // Now you can safely call filter or other array methods on ordersArray
      // This line was likely causing the error:
      // const currentMonthOrders = data.filter(...);
      
      // Assuming the rest of the logic uses this processed array:
      setOrders(ordersArray);
      // ... rest of the success logic ...

    } catch (err: any) {
      console.error('OrdersDashboard: Error fetching orders:', err);
      setError('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
      setOrders([]); // Set orders to empty array on error
    } finally {
      console.log('OrdersDashboard: fetchOrders finished. Loading set to false.');
      setLoading(false);
    }
  };

  const handleAddOrder = async (order: any) => {
    try {
      console.log('OrdersDashboard: Attempting to create order:', order);
      setLoading(true); // Set loading to true during order creation
      const response = await orderService.createOrder(order);
      console.log('OrdersDashboard: Order creation response:', response);
      console.log('OrdersDashboard: Order created successfully. Refreshing orders...');
      await fetchOrders(); // Refresh the orders list
      console.log('OrdersDashboard: Orders refreshed after creation.');
      setShowOrderForm(false);
      setLoading(false); // Set loading to false after order creation and refresh
    } catch (err: any) {
      console.error('OrdersDashboard: Error in handleAddOrder:', err);
      setError(err.response?.data?.message || 'Failed to create order');
      setLoading(false); // Set loading to false on error
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getItemCounts = (orders: Order[]) => {
    const countsByShop: Record<string, Record<string, number>> = {};

    orders.forEach(order => {
      const shop = order.shop || 'restaurant1'; // Default to restaurant1 if shop is missing
      
      if (!countsByShop[shop]) {
        countsByShop[shop] = {};
      }

      for (const itemName in order.items) {
        if (order.items.hasOwnProperty(itemName)) {
          countsByShop[shop][itemName] = (countsByShop[shop][itemName] || 0) + order.items[itemName];
        }
      }
    });
    return countsByShop;
  };

  const itemCountsByShop = getItemCounts(orders);
  const currentDate = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Orders Dashboard
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowOrderForm(!showOrderForm)}
              sx={{ mr: 2 }}
            >
              {showOrderForm ? 'Hide Form' : 'Create New Order'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {showOrderForm && (
          <Box sx={{ mb: 4 }}>
            <OrderForm onAddOrder={handleAddOrder} employeeName={user?.name || ''} />
          </Box>
        )}

        {/* Display summaries for each shop */}
        {Object.entries(itemCountsByShop).map(([shopName, itemCounts]) => (
          <Grid container spacing={3} key={shopName} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {shopName === 'restaurant1' 
                      ? `Restaurant 1 Summary (Inside Mall)` 
                      : `Restaurant 2 Summary (outside Mall)`} 
                    - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  {Object.entries(itemCounts).length === 0 ? (
                    <Typography>No orders placed for this restaurant this month.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {Object.entries(itemCounts).map(([itemName, count]) => (
                        <Grid item xs={12} sm={6} md={4} key={itemName}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1">
                              {itemName}
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {count}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Container>
  );
} 