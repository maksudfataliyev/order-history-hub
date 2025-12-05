import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
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

const Compare = () => {
  const { t } = useLanguage();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t.compare.title}
            </h1>
            <p className="text-muted-foreground mb-8">{t.compare.empty}</p>
            <Link to="/catalog">
              <Button variant="hero">
                Browse Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const compareFields = [
    { key: 'price', label: t.catalog.price, render: (p: typeof compareList[0]) => `₼${p.price}` },
    { key: 'condition', label: t.product.condition, render: (p: typeof compareList[0]) => getConditionLabel(p.condition, t) },
    { key: 'category', label: t.catalog.category, render: (p: typeof compareList[0]) => getCategoryLabel(p.category, t) },
    { key: 'dimensions', label: t.product.dimensions, render: (p: typeof compareList[0]) => `${p.dimensions.width}×${p.dimensions.height}×${p.dimensions.depth} cm` },
    { key: 'barter', label: 'Barter', render: (p: typeof compareList[0]) => p.acceptsBarter ? 'Yes' : 'No' },
    { key: 'seller', label: t.product.seller, render: (p: typeof compareList[0]) => p.seller },
  ];

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.compare.title}
            </h1>
            <p className="text-muted-foreground">
              {compareList.length} items selected
            </p>
          </div>
          <Button variant="outline" onClick={clearCompare}>
            {t.compare.clear}
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Product Images & Names */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
              <div />
              {compareList.map((product) => (
                <div key={product.id} className="relative">
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-xl mb-3"
                    />
                    <h3 className="font-display font-semibold text-foreground line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="mt-8 space-y-0">
              {compareFields.map((field, index) => (
                <div
                  key={field.key}
                  className={`grid gap-4 py-4 ${index % 2 === 0 ? 'bg-muted/50' : ''} rounded-lg`}
                  style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
                >
                  <div className="font-semibold text-foreground px-4">
                    {field.label}
                  </div>
                  {compareList.map((product) => (
                    <div key={product.id} className="text-muted-foreground px-4">
                      {field.render(product)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div
              className="grid gap-4 mt-8 pt-8 border-t border-border"
              style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
            >
              <div />
              {compareList.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Button variant="hero" className="w-full">
                    View Details
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Compare;
