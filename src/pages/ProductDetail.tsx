import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Scale, RefreshCw, ShoppingCart, Check, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from '@/hooks/use-toast';

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

const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { addToCompare, isInCompare } = useCompare();
  
  const product = mockProducts.find(p => p.id === id);
  const inCompare = product ? isInCompare(product.id) : false;

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Link to="/catalog">
            <Button variant="outline" className="mt-4">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const conditionLabel = getConditionLabel(product.condition, t);
  const categoryLabel = getCategoryLabel(product.category, t);

  const handleAddToCompare = () => {
    addToCompare(product);
    toast({
      title: 'Added to compare',
      description: `${product.name} has been added to comparison`,
    });
  };

  const handleMakeOffer = () => {
    toast({
      title: 'Offer Feature',
      description: 'Barter offer system coming soon!',
    });
  };

  const handleBuyNow = () => {
    toast({
      title: 'Checkout',
      description: 'Payment system coming soon!',
    });
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Back Button */}
        <Link to="/catalog">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-2xl shadow-medium"
            />
            {product.acceptsBarter && (
              <Badge className="absolute top-4 left-4 bg-sage text-sage-dark">
                <RefreshCw className="w-3 h-3 mr-1" />
                Barter Available
              </Badge>
            )}
          </div>

          {/* Details */}
          <div>
            <Badge variant="outline" className="mb-4">
              {categoryLabel}
            </Badge>
            
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-4xl font-bold text-primary">
                ₼{product.price}
              </span>
              <Badge variant="secondary">
                {conditionLabel}
              </Badge>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.product.seller}</p>
                <p className="font-semibold text-foreground">{product.seller}</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">{t.upload.width}</p>
                <p className="font-display font-semibold text-foreground">{product.dimensions.width} cm</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">{t.upload.height}</p>
                <p className="font-display font-semibold text-foreground">{product.dimensions.height} cm</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">{t.upload.depth}</p>
                <p className="font-display font-semibold text-foreground">{product.dimensions.depth} cm</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button variant="hero" size="lg" className="flex-1" onClick={handleBuyNow}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t.product.buyNow}
              </Button>
              {product.acceptsBarter && (
                <Button variant="sage" size="lg" className="flex-1" onClick={handleMakeOffer}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {t.product.makeOffer}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAddToCompare}
              disabled={inCompare}
            >
              {inCompare ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Compare
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  {t.product.addToCompare}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList>
            <TabsTrigger value="description">{t.product.description}</TabsTrigger>
            <TabsTrigger value="specifications">{t.product.specifications}</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <dl className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">{t.catalog.category}</dt>
                  <dd className="font-semibold text-foreground">{categoryLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.product.condition}</dt>
                  <dd className="font-semibold text-foreground">{conditionLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">{t.product.dimensions}</dt>
                  <dd className="font-semibold text-foreground">
                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Barter</dt>
                  <dd className="font-semibold text-foreground">
                    {product.acceptsBarter ? 'Yes' : 'No'}
                  </dd>
                </div>
              </dl>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProductDetail;
