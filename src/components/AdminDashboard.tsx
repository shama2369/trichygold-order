import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Container,
  Button,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  PersonAdd as AddEmployeeIcon,
  Logout as LogoutIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Register from './Register';
import EmployeeOrderSummary from './EmployeeOrderSummary';
import AllOrdersSummary from './AllOrdersSummary';

const drawerWidth = 240;

type View = 'welcome' | 'register' | 'employee-summary' | 'all-orders-summary';

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('welcome');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (view: View) => {
    setCurrentView(view);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuItemClick('register')}>
          <ListItemIcon>
            <AddEmployeeIcon />
          </ListItemIcon>
          <ListItemText primary="Register Employee" />
        </ListItem>
        <ListItem button onClick={() => handleMenuItemClick('employee-summary')}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Employee Orders Summary" />
        </ListItem>
        <ListItem button onClick={() => handleMenuItemClick('all-orders-summary')}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="All Orders Summary" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'register':
        return (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>Register New Employee</Typography>
            <Register />
          </Box>
        );
      case 'employee-summary':
        return (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>Employee Orders Summary</Typography>
            <EmployeeOrderSummary />
          </Box>
        );
      case 'all-orders-summary':
        return (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>All Orders Summary</Typography>
            <AllOrdersSummary />
          </Box>
        );
      case 'welcome':
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to Admin Dashboard
            </Typography>
            <Typography>
              Please select an option from the menu to get started.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Trichy Gold Order Management (Admin)
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
} 