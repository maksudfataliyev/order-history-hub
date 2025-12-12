import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSales } from './SalesContext';

export interface Offer {
  id: string;
  from: string;
  fromId: string;
  type: 'barter' | 'price';
  item?: string;
  itemImage?: string;
  amount?: number;
  forItem: string;
  forItemId: string;
  forItemImage: string;
  forItemPrice: number;
  sellerId: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  counterAmount?: number;
  createdAt: string;
}

interface OffersContextType {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => Offer;
  getOffersBySeller: () => Offer[];
  getOffersByBuyer: () => Offer[];
  acceptOffer: (id: string) => void;
  declineOffer: (id: string) => void;
  counterOffer: (id: string, amount: number) => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

const OFFERS_KEY = 'yeni_nefes_offers';

export const OffersProvider = ({ children }: { children: ReactNode }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const { user } = useAuth();
  const { addSale } = useSales();

  useEffect(() => {
    const storedOffers = localStorage.getItem(OFFERS_KEY);
    if (storedOffers) {
      try {
        setOffers(JSON.parse(storedOffers));
      } catch {
        localStorage.removeItem(OFFERS_KEY);
      }
    }
  }, []);

  const saveOffers = (newOffers: Offer[]) => {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(newOffers));
    setOffers(newOffers);
  };

  const addOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>): Offer => {
    const newOffer: Offer = {
      ...offerData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveOffers([...offers, newOffer]);
    return newOffer;
  };

  const getOffersBySeller = (): Offer[] => {
    if (!user) return [];
    return offers
      .filter(offer => offer.sellerId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getOffersByBuyer = (): Offer[] => {
    if (!user) return [];
    return offers
      .filter(offer => offer.fromId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const acceptOffer = (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer || !user) return;

    // Add to sales when accepting
    addSale({
      sellerId: user.id,
      buyerId: offer.fromId,
      buyerName: offer.from,
      buyerEmail: `${offer.from.toLowerCase().replace(' ', '.')}@example.com`,
      productId: offer.forItemId,
      productName: offer.forItem,
      productImage: offer.forItemImage,
      productPrice: offer.amount || offer.forItemPrice,
      shippingMethod: 'standard',
      shippingPrice: 0,
      total: offer.amount || offer.forItemPrice,
      buyerAddress: {
        street: 'To be confirmed',
        city: 'To be confirmed',
      },
      status: 'confirmed',
    });

    const updatedOffers = offers.map(o => 
      o.id === id ? { ...o, status: 'accepted' as const } : o
    );
    saveOffers(updatedOffers);
  };

  const declineOffer = (id: string) => {
    const updatedOffers = offers.map(o => 
      o.id === id ? { ...o, status: 'declined' as const } : o
    );
    saveOffers(updatedOffers);
  };

  const counterOffer = (id: string, amount: number) => {
    const updatedOffers = offers.map(o => 
      o.id === id ? { ...o, status: 'countered' as const, counterAmount: amount } : o
    );
    saveOffers(updatedOffers);
  };

  return (
    <OffersContext.Provider value={{ 
      offers, 
      addOffer, 
      getOffersBySeller, 
      getOffersByBuyer, 
      acceptOffer, 
      declineOffer, 
      counterOffer 
    }}>
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};
