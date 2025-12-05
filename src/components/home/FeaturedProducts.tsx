import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';

export const FeaturedProducts = () => {
  const { t } = useLanguage();
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {t.catalog.title}
          </h2>
          <Link to="/catalog">
            <Button variant="ghost" className="gap-2">
              {t.catalog.all}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
