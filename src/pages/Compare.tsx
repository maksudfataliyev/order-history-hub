import { Link } from 'react-router-dom';
import { X, ArrowRight, Scale, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';

const getConditionLabel = (condition: string, t: ReturnType<typeof useLanguage>['t']) => {
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
  };
  return conditionMap[condition] || condition;
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'new':
      return 'bg-sage text-sage-dark';
    case 'likeNew':
      return 'bg-primary/20 text-primary';
    case 'good':
      return 'bg-muted text-muted-foreground';
    case 'fair':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Compare = () => {
  const { t } = useLanguage();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-20 min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t.compare.title}
            </h1>
            <p className="text-muted-foreground mb-8">{t.compare.empty}</p>
            <Link to="/catalog">
              <Button variant="hero" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t.compare.browseCatalog}
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const compareFields = [
    { key: 'price', label: t.catalog.price, render: (p: typeof compareList[0]) => (
      <span className="font-display text-2xl font-bold text-primary">₼{p.price}</span>
    )},
    { key: 'condition', label: t.product.condition, render: (p: typeof compareList[0]) => (
      <Badge className={`${getConditionColor(p.condition)} px-3 py-1`}>{getConditionLabel(p.condition, t)}</Badge>
    )},
    { key: 'dimensions', label: t.product.dimensions, render: (p: typeof compareList[0]) => (
      <div className="text-foreground">
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {p.dimensions.width} × {p.dimensions.height} × {p.dimensions.depth} cm
        </span>
      </div>
    )},
    { key: 'barter', label: t.compare.barter, render: (p: typeof compareList[0]) => (
      <Badge variant={p.acceptsBarter ? 'default' : 'secondary'} className={p.acceptsBarter ? 'bg-sage text-sage-dark px-3 py-1' : 'px-3 py-1'}>
        {p.acceptsBarter ? '✓ ' + t.compare.yes : t.compare.no}
      </Badge>
    )},
    { key: 'seller', label: t.product.seller, render: (p: typeof compareList[0]) => (
      <span className="text-muted-foreground font-medium">{p.seller}</span>
    )},
  ];

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-sage/20 rounded-2xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {t.compare.title}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {compareList.length} {t.compare.itemsSelected}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={clearCompare} className="shrink-0 gap-2">
            <X className="w-4 h-4" />
            {t.compare.clear}
          </Button>
        </motion.div>

        {/* Product Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 mb-10"
          style={{ gridTemplateColumns: `repeat(${Math.min(compareList.length, 4)}, 1fr)` }}
        >
          {compareList.map((product, index) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="relative group"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-display font-semibold text-foreground line-clamp-2 text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary font-display">₼{product.price}</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
        >
          {compareFields.map((field, index) => (
            <div
              key={field.key}
              className={`grid gap-6 py-5 px-6 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-card'} ${index !== compareFields.length - 1 ? 'border-b border-border/50' : ''}`}
              style={{ gridTemplateColumns: `180px repeat(${Math.min(compareList.length, 4)}, 1fr)` }}
            >
              <div className="flex items-center">
                <span className="font-semibold text-foreground">
                  {field.label}
                </span>
              </div>
              {compareList.map((product) => (
                <div key={product.id} className="flex items-center justify-center">
                  {field.render(product)}
                </div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 mt-8"
          style={{ gridTemplateColumns: `180px repeat(${Math.min(compareList.length, 4)}, 1fr)` }}
        >
          <div />
          {compareList.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Button variant="hero" className="w-full gap-2">
                {t.compare.viewDetails}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Compare;
