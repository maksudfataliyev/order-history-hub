import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { OrderTracking } from '@/components/ui/order-tracking';
import { Order } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailDialog = ({ order, open, onOpenChange }: OrderDetailDialogProps) => {
  const { t } = useLanguage();

  if (!order) return null;

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      placed: (t.dashboard.orderStatus as Record<string, string>)?.placed || 'Placed',
      confirmed: (t.dashboard.orderStatus as Record<string, string>)?.confirmed || 'Confirmed',
      shipped: (t.dashboard.orderStatus as Record<string, string>)?.shipped || 'Shipped',
      outForDelivery: (t.dashboard.orderStatus as Record<string, string>)?.outForDelivery || 'Out for Delivery',
      delivered: (t.dashboard.orderStatus as Record<string, string>)?.delivered || 'Delivered',
    };
    return statusMap[status] || status;
  };

  const shippingMethodLabels: Record<string, string> = {
    standard: t.shipping?.standard || 'Standard Shipping',
    express: t.shipping?.express || 'Express Shipping',
    sameDay: t.shipping?.sameDay || 'Same Day Delivery',
  };

  const orderSteps = [
    { 
      name: t.checkout?.orderPlacedStep || 'Order Placed', 
      timestamp: new Date(order.createdAt).toLocaleString(), 
      isCompleted: true 
    },
    { 
      name: t.checkout?.confirmed || 'Confirmed', 
      timestamp: order.status !== 'placed' ? new Date(order.updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), 
      isCompleted: ['confirmed', 'shipped', 'outForDelivery', 'delivered'].includes(order.status) 
    },
    { 
      name: t.checkout?.shipped || 'Shipped', 
      timestamp: ['shipped', 'outForDelivery', 'delivered'].includes(order.status) ? new Date(order.updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), 
      isCompleted: ['shipped', 'outForDelivery', 'delivered'].includes(order.status) 
    },
    { 
      name: t.checkout?.outForDelivery || 'Out for Delivery', 
      timestamp: ['outForDelivery', 'delivered'].includes(order.status) ? new Date(order.updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), 
      isCompleted: ['outForDelivery', 'delivered'].includes(order.status) 
    },
    { 
      name: t.checkout?.delivered || 'Delivered', 
      timestamp: order.status === 'delivered' ? new Date(order.updatedAt).toLocaleString() : (t.checkout?.pending || 'Pending'), 
      isCompleted: order.status === 'delivered' 
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t.checkout?.orderNumber || 'Order'}: #{order.id.slice(0, 8).toUpperCase()}</span>
            <Badge
              className={cn(
                order.status === 'placed' && 'bg-primary/20 text-primary',
                order.status === 'confirmed' && 'bg-blue-100 text-blue-700',
                order.status === 'shipped' && 'bg-yellow-100 text-yellow-700',
                order.status === 'outForDelivery' && 'bg-orange-100 text-orange-700',
                order.status === 'delivered' && 'bg-sage text-sage-dark'
              )}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={order.productImage}
              alt={order.productName}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{order.productName}</h3>
              <p className="text-primary font-display text-xl font-bold">₼{order.productPrice}</p>
            </div>
          </div>

          {/* Order Tracking */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.checkout?.orderTracking || 'Order Tracking'}</h4>
            <OrderTracking steps={orderSteps} />
          </div>

          {/* Order Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.deliveryAddress || 'Delivery Address'}</h4>
              <p className="text-sm text-muted-foreground">{order.address.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.address.street}</p>
              <p className="text-sm text-muted-foreground">{order.address.city}</p>
              <p className="text-sm text-muted-foreground">{order.address.phone}</p>
              <p className="text-sm text-muted-foreground">{order.address.email}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{t.checkout?.orderSummary || 'Order Summary'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.checkout?.subtotal || 'Subtotal'}</span>
                  <span>₼{order.productPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{shippingMethodLabels[order.shippingMethod]}</span>
                  <span>₼{order.shippingCost}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                  <span>{t.checkout?.total || 'Total'}</span>
                  <span className="text-primary">₼{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Date */}
          <p className="text-sm text-muted-foreground text-center">
            {t.dashboard?.orderPlaced || 'Order placed'}: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
