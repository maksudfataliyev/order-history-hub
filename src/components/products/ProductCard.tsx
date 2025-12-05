import { Link } from 'react-router-dom';
import { Scale, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

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

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { t } = useLanguage();
  const inCompare = isInCompare(product.id);

  const conditionLabel = getConditionLabel(product.condition, t);
  const categoryLabel = getCategoryLabel(product.category, t);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-1 border border-border">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {categoryLabel}
            </Badge>
            {product.acceptsBarter && (
              <Badge className="bg-sage text-sage-dark">
                <RefreshCw className="w-3 h-3 mr-1" />
                Barter
              </Badge>
            )}
          </div>

          {/* Compare Button */}
          <Button
            size="icon"
            variant={inCompare ? "default" : "secondary"}
            className={cn(
              "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity",
              inCompare && "opacity-100"
            )}
            onClick={handleCompareClick}
          >
            {inCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {conditionLabel} • {product.dimensions.width}x{product.dimensions.height}x{product.dimensions.depth} cm
          </p>

          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">
              ₼{product.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.seller}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
