import axios from 'axios';
// Removed import { Employee } from '../models/Employee';
// Removed import { dataService } from './dataService';

// Determine API URL based on environment
// In production, use relative URL which will work with Railway deployment
// In development, use localhost with port
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    isAdmin: boolean;
  };
}

interface RegisterResponse {
  message: string;
  employee: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}

// Define a TypeScript interface for employee data received from the API
export interface EmployeeData {
  _id: string;
  name: string;
  username: string;
  role: string;
  // Include other fields if the API returns them, like createdAt, updatedAt
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData: { name: string; username: string; password: string }): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAllEmployees: async (): Promise<{ employees: EmployeeData[] }> => {
    const response = await api.get<{ employees: EmployeeData[] }>('/auth/employees');
    return response.data;
  },
};

export const orderService = {
  getOrders: async () => {
    console.log('API: Getting orders')
    const response = await api.get('/orders');
    console.log('API: Got orders response:', response.data)
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: any) => {
    console.log('API: Creating order with data:', orderData)
    const response = await api.post('/orders', orderData);
    console.log('API: Create order response:', response.data)
    return response.data;
  },

  updateOrder: async (id: string, orderData: any) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getEmployeeOrderSummary: async (employeeId: string, month: number, year: number, restaurant?: string): Promise<any> => {
    console.log('API: Getting employee order summary for:', { employeeId, month, year, restaurant });
    const response = await api.get('/orders', {
      params: {
        employeeId,
        month,
        year,
        ...(restaurant && { shop: restaurant })
      },
    });
    console.log('API: Got employee order summary response:', response.data);
    return response.data;
  },

  getAllOrdersSummary: async (month: number, year: number, restaurant?: string): Promise<any> => {
    console.log('API: Getting all orders summary for:', { month, year, restaurant });
    const response = await api.get('/orders/summary', {
      params: {
        month,
        year,
        ...(restaurant && { shop: restaurant })
      },
    });
    console.log('API: Got all orders summary response:', response.data);
    return response.data;
  },
};

export default api; 