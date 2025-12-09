import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { mockProducts } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const categories = ['all', 'sofa', 'chair', 'table', 'bed', 'storage', 'desk'];
const conditions = ['all', 'new', 'likeNew', 'good', 'fair'];
const ITEMS_PER_PAGE = 12;

const getCategoryLabel = (cat: string, t: ReturnType<typeof useLanguage>['t']) => {
  if (cat === 'all') return t.catalog.all;
  return t.catalog.categories[cat as keyof typeof t.catalog.categories] || cat;
};

const getConditionLabel = (cond: string, t: ReturnType<typeof useLanguage>['t']) => {
  if (cond === 'all') return t.catalog.all;
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
  };
  return conditionMap[cond] || cond;
};

const Catalog = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [search, selectedCategory, selectedCondition]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedCondition]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCategory !== 'all' || selectedCondition !== 'all';

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t.catalog.title}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {t.catalog.itemsFound || 'items found'}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t.catalog.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.catalog.filter}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              {t.catalog.clear || 'Clear'}
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t.catalog.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedCategory === cat && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {getCategoryLabel(cat, t)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t.catalog.condition}</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((cond) => (
                    <Badge
                      key={cond}
                      variant={selectedCondition === cond ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedCondition === cond && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => setSelectedCondition(cond)}
                    >
                      {getConditionLabel(cond, t)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9"
                      >
                        ←
                      </Button>
                    </PaginationItem>

                    {showLeftEllipsis && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      </>
                    )}

                    {pages.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {showRightEllipsis && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9"
                      >
                        →
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">{t.catalog.noProducts || 'No products found'}</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              {t.catalog.clearFilters || 'Clear Filters'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Catalog;
