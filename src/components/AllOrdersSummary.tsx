import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { orderService } from '../services/api';

interface OrderSummary {
  items: {
    [key: string]: number;
  };
}

const RESTAURANTS = [
  { id: 'restaurant1', name: 'Restaurant 1 (Inside Mall)' },
  { id: 'restaurant2', name: 'Restaurant 2 (outside Mall)' },
  { id: 'all', name: 'All Restaurants' }
];

export default function AllOrdersSummary() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Last 5 years

  const fetchOrderSummary = async () => {
    setLoading(true);
    setError('');
    setOrderSummary(null);

    try {
      console.log(`AllOrdersSummary: Fetching order summary for month ${selectedMonth}, year ${selectedYear}, restaurant ${selectedRestaurant}...`);
      const response = await orderService.getAllOrdersSummary(
        selectedMonth,
        selectedYear,
        selectedRestaurant === 'all' ? undefined : selectedRestaurant
      );
      console.log('AllOrdersSummary: Fetched order summary response:', response);

      if (response && response.items) {
        console.log('AllOrdersSummary: Setting order summary with items:', response.items);
        setOrderSummary(response);
      } else {
        console.log('AllOrdersSummary: No items found in response');
        setOrderSummary({ items: {} });
      }
    } catch (err: any) {
      console.error('AllOrdersSummary: Error fetching order summary:', err);
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to fetch order summary';
      setError(errorMessage);
      setOrderSummary(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>Select Criteria</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={selectedRestaurant}
              label="Restaurant"
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              {RESTAURANTS.map((restaurant) => (
                <MenuItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchOrderSummary} 
            disabled={loading}
            fullWidth
          >
            Fetch Summary
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {orderSummary && Object.entries(orderSummary.items).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Total Orders Summary for {selectedMonth}/{selectedYear}
            {selectedRestaurant !== 'all' && ` - ${RESTAURANTS.find(r => r.id === selectedRestaurant)?.name}`}
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(orderSummary.items).map(([itemName, count]) => (
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
        </Box>
      )}

      {!loading && !error && !orderSummary && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No orders found for the selected criteria.
        </Alert>
      )}
    </Box>
  );
} 