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

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedSales = localStorage.getItem(SALES_KEY);
    if (storedSales) {
      try {
        setSales(JSON.parse(storedSales));
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
    return sales
      .filter(sale => sale.sellerId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
