import { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { authService } from '../services/api'

interface Employee {
  id: string
  name: string
  username: string
  role: string
  shop: string
}

export default function EmployeeManagement() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    shop: 'internal',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authService.register(formData)
      setSuccess('Employee registered successfully')
      setFormData({
        name: '',
        username: '',
        password: '',
        shop: 'internal',
      })
      // Refresh employee list
      // TODO: Add getEmployees endpoint and call it here
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Register New Employee
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Shop"
              value={formData.shop}
              onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              required
            >
              <MenuItem value="internal">Internal</MenuItem>
              <MenuItem value="external">External</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Employee'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Employee List
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Shop</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.username}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.shop}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
} 