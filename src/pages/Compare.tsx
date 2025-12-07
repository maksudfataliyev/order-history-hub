import { Link } from 'react-router-dom';
import { X, ArrowRight, Scale, ShoppingBag } from 'lucide-react';
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

const getCategoryLabel = (category: string, t: ReturnType<typeof useLanguage>['t']) => {
  return t.catalog.categories[category as keyof typeof t.catalog.categories] || category;
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
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-muted-foreground" />
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
      <span className="font-display text-lg font-bold text-primary">₼{p.price}</span>
    )},
    { key: 'condition', label: t.product.condition, render: (p: typeof compareList[0]) => (
      <Badge className={getConditionColor(p.condition)}>{getConditionLabel(p.condition, t)}</Badge>
    )},
    { key: 'category', label: t.catalog.category, render: (p: typeof compareList[0]) => (
      <span className="text-foreground">{getCategoryLabel(p.category, t)}</span>
    )},
    { key: 'dimensions', label: t.product.dimensions, render: (p: typeof compareList[0]) => (
      <span className="text-foreground font-mono text-sm">{p.dimensions.width}×{p.dimensions.height}×{p.dimensions.depth} cm</span>
    )},
    { key: 'barter', label: t.compare.barter, render: (p: typeof compareList[0]) => (
      <Badge variant={p.acceptsBarter ? 'default' : 'secondary'} className={p.acceptsBarter ? 'bg-sage text-sage-dark' : ''}>
        {p.acceptsBarter ? t.compare.yes : t.compare.no}
      </Badge>
    )},
    { key: 'seller', label: t.product.seller, render: (p: typeof compareList[0]) => (
      <span className="text-muted-foreground">{p.seller}</span>
    )},
  ];

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {t.compare.title}
              </h1>
              <p className="text-muted-foreground">
                {compareList.length} {t.compare.itemsSelected}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={clearCompare} className="shrink-0">
            <X className="w-4 h-4 mr-2" />
            {t.compare.clear}
          </Button>
        </motion.div>

        {/* Comparison Cards - Mobile Friendly */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[600px]">
            {/* Product Cards Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 mb-6" 
              style={{ gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)` }}
            >
              <div className="flex items-end pb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t.catalog.category}
                </span>
              </div>
              {compareList.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-foreground line-clamp-2 text-sm sm:text-base">
                        {product.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Comparison Table */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {compareFields.map((field, index) => (
                <div
                  key={field.key}
                  className={`grid gap-4 py-4 px-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-card'} ${index !== compareFields.length - 1 ? 'border-b border-border/50' : ''}`}
                  style={{ gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)` }}
                >
                  <div className="flex items-center">
                    <span className="font-medium text-foreground text-sm">
                      {field.label}
                    </span>
                  </div>
                  {compareList.map((product) => (
                    <div key={product.id} className="flex items-center">
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
              className="grid gap-4 mt-6"
              style={{ gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)` }}
            >
              <div />
              {compareList.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Button variant="hero" className="w-full">
                    {t.compare.viewDetails}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Compare;