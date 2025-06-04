export type ItemType = 'Karak Tea' | 'Milk Tea' | 'Coffee' | 'Rani' | 'Soft Drinks' | 'Fresh Juice' | 'Sandwich' | 'Shawarma'

export interface Order {
  _id: string;
  items: {
    [key in ItemType]?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdBy: string;
  employeeId: string;
  shop: 'restaurant1' | 'restaurant2';
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
} 