import { Truck, Clock, MapPin, Package, Shield, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const Shipping = () => {
  const { t } = useLanguage();

  const shippingOptions = [
    {
      id: 'standard',
      name: t.shipping.standard,
      price: 15,
      duration: t.shipping.standardDuration,
      icon: Package,
      description: t.shipping.standardDesc,
      color: 'bg-muted',
    },
    {
      id: 'express',
      name: t.shipping.express,
      price: 35,
      duration: t.shipping.expressDuration,
      icon: Truck,
      description: t.shipping.expressDesc,
      color: 'bg-primary/10',
      popular: true,
    },
    {
      id: 'sameDay',
      name: t.shipping.sameDay,
      price: 60,
      duration: t.shipping.sameDayDuration,
      icon: Clock,
      description: t.shipping.sameDayDesc,
      color: 'bg-sage/20',
    },
  ];

  const deliveryZones = [
    { zone: t.shipping.bakuCity, price: '₼0 - ₼15', time: t.shipping.bakuTime },
    { zone: t.shipping.bakuSuburbs, price: '₼15 - ₼25', time: t.shipping.suburbsTime },
    { zone: t.shipping.regions, price: '₼25 - ₼50', time: t.shipping.regionsTime },
    { zone: t.shipping.remote, price: '₼50 - ₼80', time: t.shipping.remoteTime },
  ];

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.shipping.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.shipping.subtitle}
          </p>
        </motion.div>

        {/* Shipping Options */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            {t.shipping.optionsTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className={`relative h-full ${option.popular ? 'ring-2 ring-primary' : ''}`}>
                  {option.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      {t.shipping.popular}
                    </Badge>
                  )}
                  <CardHeader>
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center mb-4`}>
                      <option.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{option.name}</span>
                      <span className="text-primary font-display">₼{option.price}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{option.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Delivery Zones */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            {t.shipping.zonesTitle}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {deliveryZones.map((zone, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{zone.zone}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold text-primary">{zone.price}</p>
                      <p className="text-sm text-muted-foreground">{zone.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            {t.shipping.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t.shipping.insurance}</h3>
                <p className="text-sm text-muted-foreground">{t.shipping.insuranceDesc}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Package className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t.shipping.packaging}</h3>
                <p className="text-sm text-muted-foreground">{t.shipping.packagingDesc}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <CreditCard className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t.shipping.payment}</h3>
                <p className="text-sm text-muted-foreground">{t.shipping.paymentDesc}</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Shipping;
