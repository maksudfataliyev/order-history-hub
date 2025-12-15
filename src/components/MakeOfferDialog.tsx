import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, DollarSign, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOffers } from '@/contexts/OffersContext';
import { toast } from '@/hooks/use-toast';

interface MakeOfferDialogProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    seller: string;
    sellerId?: string;
  };
  children: React.ReactNode;
}

export const MakeOfferDialog = ({ product, children }: MakeOfferDialogProps) => {
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const { user } = useAuth();
  const { addOffer } = useOffers();

  const handleSubmitOffer = () => {
    if (!user) return;
    
    const price = parseFloat(offerPrice);
    if (!price || price <= 0) {
      toast({
        title: 'Invalid offer',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    addOffer({
      from: `${user.firstName} ${user.lastName}`,
      fromId: user.id,
      type: 'price',
      amount: price,
      forItem: product.name,
      forItemId: product.id,
      forItemImage: product.image,
      forItemPrice: product.price,
      sellerId: product.sellerId || 'seller-1',
      status: 'pending',
    });

    toast({
      title: 'Offer sent!',
      description: `Your offer of ₼${price} has been sent to the seller.`,
    });

    setOfferPrice('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Make an Offer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
              <p className="text-sm text-muted-foreground">Listed at ₼{product.price}</p>
              <p className="text-xs text-muted-foreground">Seller: {product.seller}</p>
            </div>
          </div>

          {/* Offer Price Input */}
          <div>
            <Label htmlFor="offer-price" className="text-sm font-medium">
              Your Offer Price (₼)
            </Label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="offer-price"
                type="number"
                placeholder="Enter your offer"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Suggest a price lower than the listed price. The seller can accept, decline, or counter your offer.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 gap-2" 
              onClick={handleSubmitOffer}
              disabled={!offerPrice}
            >
              <Send className="w-4 h-4" />
              Send Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
