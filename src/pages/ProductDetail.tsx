import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, RefreshCw, ShoppingCart, Check, User, Plus, Send, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockProducts } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useComments } from '@/contexts/CommentsContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MakeOfferDialog } from '@/components/MakeOfferDialog';

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
  const { isAuthenticated, user } = useAuth();
  const { addToCart, items } = useCart();
  const { addComment, getCommentsByProduct, deleteComment } = useComments();
  const navigate = useNavigate();
  const product = mockProducts.find(p => p.id === id);
  const inCompare = product ? isInCompare(product.id) : false;
  const inCart = product ? items.some(item => item.id === product.id) : false;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [commentText, setCommentText] = useState('');
  
  const productImages = product?.images || (product ? [product.image] : []);
  const productComments = product ? getCommentsByProduct(product.id) : [];

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

  const handleMakeOfferClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to make an offer',
      });
      navigate('/auth');
      return;
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to add items to cart' });
      navigate('/auth');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      condition: product.condition,
      dimensions: `${product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth}cm`,
    });
    toast({ title: t.cart?.addToCart || 'Added to Cart', description: product.name });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to make a purchase',
      });
      navigate('/auth');
      return;
    }
    navigate('/checkout', { state: { productId: product.id } });
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
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productImages[selectedImage]}
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
            
            {/* Image Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
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
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button 
                variant={inCart ? "outline" : "hero"} 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {inCart ? 'In Cart' : (t.cart?.addToCart || 'Add to Cart')}
              </Button>
              {product.acceptsBarter && isAuthenticated && (
                <MakeOfferDialog product={{ ...product, sellerId: 'seller-1' }}>
                  <Button variant="sage" size="lg" className="flex-1">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    {t.product.makeOffer}
                  </Button>
                </MakeOfferDialog>
              )}
              {product.acceptsBarter && !isAuthenticated && (
                <Button variant="sage" size="lg" className="flex-1" onClick={handleMakeOfferClick}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {t.product.makeOffer}
                </Button>
              )}
            </div>

            <div className="flex gap-3 mb-8">
              <Button variant="outline" size="lg" className="flex-1" onClick={handleBuyNow}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t.product.buyNow}
              </Button>
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
                {product.weight && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Weight</dt>
                    <dd className="font-semibold text-foreground">{product.weight} kg</dd>
                  </div>
                )}
                {product.material && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Material</dt>
                    <dd className="font-semibold text-foreground capitalize">{product.material}</dd>
                  </div>
                )}
                {product.color && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Color</dt>
                    <dd className="font-semibold text-foreground capitalize">{product.color}</dd>
                  </div>
                )}
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

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Comments ({productComments.length})
          </h2>
          
          {/* Add Comment */}
          {isAuthenticated ? (
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-3 resize-none"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (commentText.trim()) {
                        addComment(product.id, commentText.trim());
                        setCommentText('');
                        toast({ title: 'Comment added!' });
                      }
                    }}
                    disabled={!commentText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-6 text-center mb-6">
              <p className="text-muted-foreground mb-3">Login to leave a comment</p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Login
              </Button>
            </div>
          )}

          {/* Comments List */}
          {productComments.length === 0 ? (
            <div className="text-center py-8 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productComments.map((comment) => (
                <div key={comment.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {comment.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{comment.userName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              deleteComment(comment.id);
                              toast({ title: 'Comment deleted' });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
