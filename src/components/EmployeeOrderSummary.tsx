import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { authService, orderService } from '../services/api';
import { EmployeeData } from '../services/api';

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

export default function EmployeeOrderSummary() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Last 5 years

  useEffect(() => {
    // Fetch list of employees when the component mounts
    const fetchEmployees = async () => {
      try {
        console.log('EmployeeOrderSummary: Fetching employees...');
        const response = await authService.getAllEmployees();
        console.log('EmployeeOrderSummary: Fetched employees:', response.employees);
        setEmployees(response.employees);
        if (response.employees.length > 0) {
          setSelectedEmployeeId(response.employees[0]._id);
        }
      } catch (err: any) {
        console.error('EmployeeOrderSummary: Error fetching employees:', err);
        setError('Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, []);

  const fetchOrderSummary = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee.');
      setOrderSummary(null);
      return;
    }

    setLoading(true);
    setError('');
    setOrderSummary(null);

    try {
      console.log(`EmployeeOrderSummary: Fetching order summary for employee ${selectedEmployeeId}, month ${selectedMonth}, year ${selectedYear}, restaurant ${selectedRestaurant}...`);
      const response = await orderService.getEmployeeOrderSummary(
        selectedEmployeeId,
        selectedMonth,
        selectedYear,
        selectedRestaurant === 'all' ? undefined : selectedRestaurant
      );
      console.log('EmployeeOrderSummary: Fetched order summary response:', response);

      if (response && response.items) {
        console.log('EmployeeOrderSummary: Setting order summary with items:', response.items);
        setOrderSummary(response);
      } else {
        console.log('EmployeeOrderSummary: No items found in response');
        setOrderSummary(null);
      }
    } catch (err: any) {
      console.error('EmployeeOrderSummary: Error fetching order summary:', err);
      setError(err.response?.data?.message || 'Failed to fetch order summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Select Criteria</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Employee"
              onChange={(e) => setSelectedEmployeeId(e.target.value as string)}
              disabled={employees.length === 0}
            >
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name} ({employee.username})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
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
        <Grid item xs={12} sm={2}>
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
        <Grid item xs={12} sm={3}>
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
        <Grid item xs={12} sm={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchOrderSummary} 
            disabled={loading || !selectedEmployeeId}
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
            Order Summary for {selectedMonth}/{selectedYear}
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

      {!loading && !error && !orderSummary && selectedEmployeeId && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No order found for the selected criteria.
        </Alert>
      )}
    </Box>
  );
} 