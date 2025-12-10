import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  shippingMethod: 'standard' | 'express' | 'sameDay';
  shippingCost: number;
  total: number;
  address: {
    fullName: string;
    street: string;
    city: string;
    phone: string;
    email: string;
  };
  status: 'placed' | 'confirmed' | 'shipped' | 'outForDelivery' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => Order;
  getOrdersByUser: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'yeni_nefes_orders';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        localStorage.removeItem(ORDERS_KEY);
      }
    }
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      userId: user?.id || '',
      status: 'placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedOrders = [...orders, newOrder];
    saveOrders(updatedOrders);
    
    return newOrder;
  };

  const getOrdersByUser = (): Order[] => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrdersByUser }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
