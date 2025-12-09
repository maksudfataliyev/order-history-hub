import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, CreditCard, MapPin, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderTracking } from '@/components/ui/order-tracking';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { mockProducts } from '@/data/products';

const Checkout = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId;
  const product = mockProducts.find(p => p.id === productId);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: 'Bakı',
    phone: user?.phone || '',
  });

  const shippingPrices: Record<string, number> = {
    standard: 15,
    express: 35,
    sameDay: 60,
  };

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">{t.checkout.noProduct}</p>
          <Link to="/catalog">
            <Button variant="outline" className="mt-4">
              {t.compare.browseCatalog}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const shippingCost = shippingPrices[shippingMethod];
  const total = product.price + shippingCost;

  const handlePlaceOrder = () => {
    if (!address.street || !address.phone) {
      toast({
        title: t.checkout.error,
        description: t.checkout.fillRequired,
        variant: 'destructive',
      });
      return;
    }

    setOrderPlaced(true);
    toast({
      title: t.checkout.success,
      description: t.checkout.orderPlaced,
    });
  };

  const orderSteps = [
    { name: t.checkout.orderPlacedStep, timestamp: new Date().toLocaleString(), isCompleted: true },
    { name: t.checkout.confirmed, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.shipped, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.outForDelivery, timestamp: t.checkout.pending, isCompleted: false },
    { name: t.checkout.delivered, timestamp: t.checkout.pending, isCompleted: false },
  ];

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container-custom py-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-sage-dark" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.checkout.thankYou}
            </h1>
            <p className="text-muted-foreground">{t.checkout.orderConfirmation}</p>
          </motion.div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.checkout.orderTracking}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracking steps={orderSteps} />
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.checkout.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="text-primary font-display">₼{product.price}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.checkout.shipping}</span>
                  <span>₼{shippingCost}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t.checkout.total}</span>
                  <span className="text-primary">₼{total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link to="/catalog" className="flex-1">
              <Button variant="outline" className="w-full">
                {t.checkout.continueShopping}
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="hero" className="w-full">
                {t.checkout.viewOrders}
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <Link to={`/product/${product.id}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t.checkout.backToProduct}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t.checkout.shippingAddress}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">{t.checkout.street}</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder={t.checkout.streetPlaceholder}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t.checkout.city}</Label>
                    <Input id="city" value={address.city} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.auth.phone}</Label>
                    <Input
                      id="phone"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+994 XX XXX XX XX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t.checkout.shippingMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="space-y-3">
                    <Label
                      htmlFor="standard"
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <div>
                          <p className="font-medium">{t.shipping.standard}</p>
                          <p className="text-sm text-muted-foreground">{t.shipping.standardDuration}</p>
                        </div>
                      </div>
                      <span className="font-display font-semibold">₼15</span>
                    </Label>
                    <Label
                      htmlFor="express"
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" id="express" />
                        <div>
                          <p className="font-medium">{t.shipping.express}</p>
                          <p className="text-sm text-muted-foreground">{t.shipping.expressDuration}</p>
                        </div>
                      </div>
                      <span className="font-display font-semibold">₼35</span>
                    </Label>
                    <Label
                      htmlFor="sameDay"
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'sameDay' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="sameDay" id="sameDay" />
                        <div>
                          <p className="font-medium">{t.shipping.sameDay}</p>
                          <p className="text-sm text-muted-foreground">{t.shipping.sameDayDuration}</p>
                        </div>
                      </div>
                      <span className="font-display font-semibold">₼60</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t.checkout.paymentMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">{t.checkout.cashOnDelivery}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t.checkout.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold text-foreground line-clamp-2">{product.name}</p>
                    <p className="text-primary font-display">₼{product.price}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.checkout.subtotal}</span>
                    <span>₼{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.checkout.shipping}</span>
                    <span>₼{shippingCost}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                    <span>{t.checkout.total}</span>
                    <span className="text-primary">₼{total}</span>
                  </div>
                </div>

                <Button variant="hero" className="w-full mt-6" onClick={handlePlaceOrder}>
                  {t.checkout.placeOrder}
                </Button>

                <Link to="/shipping" className="block mt-4">
                  <Button variant="link" className="w-full text-sm">
                    {t.checkout.learnAboutShipping}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
