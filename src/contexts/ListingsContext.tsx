import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ListingStatus = 'pending_review' | 'approved' | 'rejected' | 'active' | 'sold';

export interface Listing {
  id: string;
  userId: string;
  name: string;
  category: string;
  condition: string;
  price: number;
  description: string;
  images: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  acceptsBarter: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string;
}

interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Listing;
  getListingsByUser: () => Listing[];
  updateListingStatus: (id: string, status: ListingStatus, note?: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

const LISTINGS_KEY = 'yeni_nefes_listings';

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedListings = localStorage.getItem(LISTINGS_KEY);
    if (storedListings) {
      try {
        setListings(JSON.parse(storedListings));
      } catch {
        localStorage.removeItem(LISTINGS_KEY);
      }
    }
  }, []);

  const saveListings = (newListings: Listing[]) => {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(newListings));
    setListings(newListings);
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Listing => {
    const newListing: Listing = {
      ...listingData,
      id: crypto.randomUUID(),
      userId: user?.id || '',
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveListings([...listings, newListing]);
    return newListing;
  };

  const getListingsByUser = (): Listing[] => {
    if (!user) return [];
    return listings
      .filter(listing => listing.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateListingStatus = (id: string, status: ListingStatus, note?: string) => {
    const updatedListings = listings.map(listing => 
      listing.id === id 
        ? { ...listing, status, reviewNote: note, updatedAt: new Date().toISOString() }
        : listing
    );
    saveListings(updatedListings);
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, getListingsByUser, updateListingStatus }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};
