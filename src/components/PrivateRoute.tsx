import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

interface PrivateRouteProps {
  element: React.ReactElement;
  isAdminRoute?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, isAdminRoute = false }) => {
  console.log('PrivateRoute: Checking authentication...');
  const user = authService.getCurrentUser();
  console.log('PrivateRoute: Current user from authService:', user);
  console.log('PrivateRoute: Is admin route:', isAdminRoute);

  if (!user) {
    // Not logged in, redirect to login page
    console.log('PrivateRoute: User not found, redirecting to /login');
    return <Navigate to="/login" />;
  }

  if (isAdminRoute && !user.isAdmin) {
    // Logged in but not an admin, redirect to the regular dashboard (assuming '/')
    console.log('PrivateRoute: User is not admin, redirecting to /');
    return <Navigate to="/" />;
  }

  // Logged in and authorized, render the requested element
  console.log('PrivateRoute: User authenticated and authorized. Rendering element.');
  return element;
};

export default PrivateRoute; 