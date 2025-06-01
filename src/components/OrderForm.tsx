import { useState } from 'react'
import {
  Paper,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'

interface OrderFormProps {
  onAddOrder: (order: any) => void
  employeeName: string
}

const ITEM_CATEGORIES = {
  'Hot Beverages': [
    'Karak Tea',
    'Milk Tea',
    'Coffee',
  ],
  'Cold Beverages': [
    'Rani',
    'Soft Drinks',
    'Fresh Juice',
  ],
  'Food Items': [
    'Sandwich',
    'Shawarma',
  ]
}

const RESTAURANTS = [
  { id: 'restaurant1', name: 'Restaurant 1 (Inside Mall)' },
  { id: 'restaurant2', name: 'Restaurant 2 (outside Mall)' },
];

export default function OrderForm({ onAddOrder, employeeName }: OrderFormProps) {
  const [items, setItems] = useState<Record<string, number>>(
    Object.values(ITEM_CATEGORIES).flat().reduce((acc, item) => ({
      ...acc,
      [item]: 0
    }), {})
  )
  const [shop, setShop] = useState('restaurant1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant1')

  const handleIncrement = (itemName: string) => {
    setItems(prev => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1
    }))
  }

  const handleDecrement = (itemName: string) => {
    setItems(prev => ({
      ...prev,
      [itemName]: Math.max(0, (prev[itemName] || 0) - 1)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Construct order data with items and selected shop
      const orderData = {
        items: Object.entries(items)
          .filter(([_, quantity]) => quantity > 0)
          .map(([name, quantity]) => ({
            name,
            quantity,
          })),
        shop,
      }

      console.log('OrderForm: Submitting order data:', orderData)
      await onAddOrder(orderData)
      console.log('OrderForm: Order submitted successfully')
      
      // Reset counters and shop selection
      setItems(
        Object.values(ITEM_CATEGORIES).flat().reduce((acc, item) => ({
          ...acc,
          [item]: 0
        }), {})
      )
      setShop('restaurant1')

    } catch (err: any) {
      console.error('Error creating order:', err)
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Place New Order</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
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

          {Object.entries(ITEM_CATEGORIES).map(([category, categoryItems]) => (
            <Grid item xs={12} key={category}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category}
                  </Typography>
                  <Grid container spacing={2}>
                    {categoryItems.map((itemName) => (
                      <Grid item xs={12} sm={6} md={4} key={itemName}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}>
                          <Typography variant="subtitle1">
                            {itemName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDecrement(itemName)}
                              disabled={items[itemName] === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2 }}>
                              {items[itemName]}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleIncrement(itemName)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                disabled={Object.values(items).every(count => count === 0) || loading}
              >
                {loading ? 'Adding...' : 'Add Item to Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
} 