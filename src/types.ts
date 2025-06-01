export type ItemType = 'tea' | 'coffee' | 'freshJuice' | 'tinJuice' | 'sandwich'

export interface Order {
  id: string;
  type: string;
  customerName: string;
  amount: number;
  description: string;
  employeeName: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
} 