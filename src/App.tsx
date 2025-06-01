import { Route, Routes, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import OrdersDashboard from './components/OrdersDashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

// Define a custom theme with purple primary color
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // A shade of purple
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Add CssBaseline for consistent styling */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute element={<OrdersDashboard />} />} />
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} isAdminRoute />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 