import { Order, ItemType } from '../types'

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
          name: order.createdBy,
          items: {
            'Karak Tea': 0,
            'Milk Tea': 0,
            'Coffee': 0,
            'Rani': 0,
            'Soft Drinks': 0,
            'Fresh Juice': 0,
            'Sandwich': 0,
            'Shawarma': 0
          },
        }
      }
      
      if (order.items) {
        Object.entries(order.items).forEach(([item, quantity]) => {
          if (item in acc[order.employeeId].items) {
            acc[order.employeeId].items[item as ItemType] += quantity
          }
        })
      }
      
      return acc
    }, {} as Record<string, { name: string; items: Record<ItemType, number> }>)

    return stats
  },

  // Clear all orders (for testing/reset)
  clearOrders: () => {
    orders = []
    localStorage.removeItem('orders')
  }
} 