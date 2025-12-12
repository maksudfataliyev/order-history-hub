import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Sale {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  shippingMethod: string;
  shippingPrice: number;
  total: number;
  buyerAddress: {
    street: string;
    city: string;
    addressDetails?: string;
    zipCode?: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Sale;
  getSalesByUser: () => Sale[];
  getSalesByPeriod: (period: 'week' | 'month' | 'year') => Sale[];
  updateSaleStatus: (id: string, status: Sale['status']) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

const SALES_KEY = 'yeni_nefes_sales';

const sampleSale: Sale = {
  id: 'sample-sale-1',
  sellerId: '',
  buyerId: 'buyer-1',
  buyerName: 'Anar M.',
  buyerEmail: 'anar.m@example.com',
  productId: '1',
  productName: 'Mid-Century Modern Sofa',
  productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  productPrice: 850,
  shippingMethod: 'standard',
  shippingPrice: 25,
  total: 875,
  buyerAddress: {
    street: '28 May Street, 45',
    city: 'Baku',
    addressDetails: 'Apartment 12',
    zipCode: 'AZ1000',
  },
  status: 'confirmed',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedSales = localStorage.getItem(SALES_KEY);
    if (storedSales) {
      try {
        const parsed = JSON.parse(storedSales);
        setSales(parsed);
      } catch {
        localStorage.removeItem(SALES_KEY);
      }
    }
  }, []);

  const saveSales = (newSales: Sale[]) => {
    localStorage.setItem(SALES_KEY, JSON.stringify(newSales));
    setSales(newSales);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    saveSales([...sales, newSale]);
    return newSale;
  };

  const getSalesByUser = (): Sale[] => {
    if (!user) return [];
    // Include sample sale for demo purposes when user has no sales
    const userSales = sales.filter(sale => sale.sellerId === user.id);
    if (userSales.length === 0) {
      // Return sample sale with current user as seller
      return [{ ...sampleSale, sellerId: user.id }];
    }
    return userSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getSalesByPeriod = (period: 'week' | 'month' | 'year'): Sale[] => {
    if (!user) return [];
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return sales
      .filter(sale => sale.sellerId === user.id && new Date(sale.createdAt) >= startDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateSaleStatus = (id: string, status: Sale['status']) => {
    const updatedSales = sales.map(sale => 
      sale.id === id ? { ...sale, status } : sale
    );
    saveSales(updatedSales);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSalesByUser, getSalesByPeriod, updateSaleStatus }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
