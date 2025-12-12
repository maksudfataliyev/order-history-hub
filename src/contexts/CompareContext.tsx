import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  condition: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  seller: string;
  description: string;
  acceptsBarter: boolean;
}

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);

  const addToCompare = (product: Product) => {
    if (compareList.length < 4 && !isInCompare(product.id)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
