import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material'
import { authService } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Login: Attempting login...')
      const response = await authService.login(formData.username, formData.password)
      console.log('Login: API login response:', response)
      
      console.log('Login: User and token saved to localStorage by authService. Checking localStorage...')
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      console.log('Login: localStorage user:', storedUser ? JSON.parse(storedUser) : null)
      console.log('Login: localStorage token:', storedToken ? 'Exists' : 'Does not exist')

      console.log('Login: Login successful. Navigating...')

      if (response.user.isAdmin) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login: Login failed:', err)
      setError(err.response?.data?.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: { xs: 4, sm: 8 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Trichy Gold
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Order Management System
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  )
} 