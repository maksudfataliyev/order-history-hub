import { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePagination } from '@/hooks/use-pagination';
import { mockProducts } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const categories = ['sofa', 'chair', 'table', 'bed', 'storage', 'desk'];
const conditions = ['new', 'likeNew', 'good', 'fair'];
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [conditionOpen, setConditionOpen] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(product.condition);
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [search, selectedCategories, selectedConditions]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, selectedConditions]);

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
    setSelectedCategories([]);
    setSelectedConditions([]);
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedConditions.length > 0;

  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors">
          {t.catalog.category}
          {categoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <Label
                htmlFor={`cat-${cat}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {getCategoryLabel(cat, t)}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Conditions */}
      <Collapsible open={conditionOpen} onOpenChange={setConditionOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          {t.catalog.condition}
          {conditionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {conditions.map((cond) => (
            <div key={cond} className="flex items-center space-x-3">
              <Checkbox
                id={`cond-${cond}`}
                checked={selectedConditions.includes(cond)}
                onCheckedChange={() => toggleCondition(cond)}
              />
              <Label
                htmlFor={`cond-${cond}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {getConditionLabel(cond, t)}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2 mt-4">
          <X className="w-4 h-4" />
          {t.catalog.clear || 'Clear Filters'}
        </Button>
      )}
    </div>
  );

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

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">
                {t.catalog.filter}
              </h2>
              <FiltersSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t.catalog.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden gap-2"
              >
                {t.catalog.filter}
              </Button>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleCategory(cat)}
                  >
                    {getCategoryLabel(cat, t)}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedConditions.map((cond) => (
                  <Badge
                    key={cond}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleCondition(cond)}
                  >
                    {getConditionLabel(cond, t)}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="lg:hidden bg-card border border-border rounded-xl p-6 mb-6 animate-slide-up">
                <FiltersSidebar />
              </div>
            )}

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
