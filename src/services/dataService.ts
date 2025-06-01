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
    const stats = orders.reduce((acc: Record<string, { name: string; items: Record<string, number> }>, order) => {
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
      
      if (order.items && typeof order.items === 'object') {
        Object.entries(order.items).forEach(([item, quantity]) => {
          if (acc[order.employeeId].items.hasOwnProperty(item)) {
            acc[order.employeeId].items[item as keyof typeof acc[order.employeeId].items] += quantity
          } else {
            console.warn(`Unexpected item name in order ${order._id}: ${item}`)
          }
        })
      }
      
      return acc
    }, {})

    return stats
  },

  // Clear all orders (for testing/reset)
  clearOrders: () => {
    orders = []
    localStorage.removeItem('orders')
  }
} 