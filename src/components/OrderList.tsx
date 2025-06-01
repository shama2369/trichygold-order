import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material'
import { Order } from '../types'

interface OrderListProps {
  orders: Order[]
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'warning'
  }
}

export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Orders
        </Typography>
        <Typography color="textSecondary" align="center">
          No orders found
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Orders
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.type}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
} 