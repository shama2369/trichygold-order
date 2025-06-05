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
      console.log('OrdersDashboard: Raw data from API:', data);

      let ordersArray: Order[] = [];
      if (data) {
        // Check if the data is a single object (for employee view) or an array (potentially for admin view)
        if (Array.isArray(data)) {
          console.log('OrdersDashboard: Data is an array');
          ordersArray = data;
        } else if (typeof data === 'object') {
          console.log('OrdersDashboard: Data is a single object');
          // If it's a single object, put it in an array
          ordersArray = [data];
        } else {
          console.warn('OrdersDashboard: Unexpected data format from API', data);
          setError('Received unexpected data format from server.');
        }
      }

      console.log('OrdersDashboard: Processed orders array:', ordersArray);

      // Filter orders for the current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      console.log('OrdersDashboard: Filtering orders for month:', currentMonth, 'year:', currentYear);

      const filteredOrders = ordersArray.filter(order => {
        const orderDate = new Date(order.createdAt);
        const isCurrentMonth = orderDate.getMonth() + 1 === currentMonth;
        const isCurrentYear = orderDate.getFullYear() === currentYear;
        console.log('OrdersDashboard: Order date:', orderDate, 'isCurrentMonth:', isCurrentMonth, 'isCurrentYear:', isCurrentYear);
        return isCurrentMonth && isCurrentYear;
      });

      console.log('OrdersDashboard: Filtered orders for current month:', filteredOrders);
      setOrders(filteredOrders);

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
    console.log('OrdersDashboard: Processing orders for item counts:', orders);
    
    const countsByShop: Record<string, Record<string, number>> = {
      restaurant1: {},
      restaurant2: {}
    };

    orders.forEach(order => {
      console.log('OrdersDashboard: Processing order:', order);
      const shop = order.shop || 'restaurant1'; // Default to restaurant1 if shop is missing
      console.log('OrdersDashboard: Order shop:', shop);
      
      // Initialize item counts for this shop if not already done
      if (!countsByShop[shop]) {
        countsByShop[shop] = {};
      }

      // Process items for this order
      if (order.items && Array.isArray(order.items)) {
        console.log('OrdersDashboard: Processing items for order:', order.items);
        order.items.forEach(item => {
          if (item.name && typeof item.quantity === 'number') {
            countsByShop[shop][item.name] = (countsByShop[shop][item.name] || 0) + item.quantity;
          }
        });
      }
    });

    // Always keep both restaurants in the counts
    if (!countsByShop.restaurant1) countsByShop.restaurant1 = {};
    if (!countsByShop.restaurant2) countsByShop.restaurant2 = {};

    console.log('OrdersDashboard: Final counts by shop:', countsByShop);
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
                  {Object.keys(itemCounts).length === 0 ? (
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