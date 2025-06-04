import { Order } from '../types'

// In-memory storage for orders
let orders: Order[] = []

// Load orders from localStorage on startup
try {
  const savedOrders = localStorage.getItem('orders')
  if (savedOrders) {
    orders = JSON.parse(savedOrders)
  }
} catch (error) {
  console.error('Error loading orders:', error)
}

export const dataService = {
  // Order operations
  getOrders: () => orders,
  
  addOrder: (order: Order) => {
    orders.push(order)
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders))
  },

  // Get orders by employee
  getOrdersByEmployee: (employeeId: string) => {
    return orders.filter(order => order.employeeId === employeeId)
  },

  // Get all employee statistics
  getEmployeeStats: () => {
    const stats = orders.reduce((acc, order) => {
      if (!acc[order.employeeId]) {
        acc[order.employeeId] = {
          name: order.employeeName,
          items: {
            tea: 0,
            coffee: 0,
            freshJuice: 0,
            tinJuice: 0,
            sandwich: 0,
          },
        }
      }
      
      Object.entries(order.items).forEach(([item, quantity]) => {
        if (typeof quantity === 'number') {
          acc[order.employeeId].items[item] = (acc[order.employeeId].items[item] || 0) + quantity;
        }
      })
      
      return acc
    }, {} as Record<string, { name: string; items: Record<string, number> }>)

    return stats
  },

  // Clear all orders (for testing/reset)
  clearOrders: () => {
    orders = []
    localStorage.removeItem('orders')
  }
} 