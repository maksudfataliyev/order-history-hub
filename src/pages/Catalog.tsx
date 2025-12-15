import { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, Weight, Palette, Layers } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
import { mockProducts, materials, colors, weightRanges } from '@/data/products';
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
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedWeightRanges, setSelectedWeightRanges] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [conditionOpen, setConditionOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pending filter state (before Apply)
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [pendingConditions, setPendingConditions] = useState<string[]>([]);
  const [pendingMaterials, setPendingMaterials] = useState<string[]>([]);
  const [pendingColors, setPendingColors] = useState<string[]>([]);
  const [pendingWeightRanges, setPendingWeightRanges] = useState<string[]>([]);
  const [pendingPriceMin, setPendingPriceMin] = useState('0');
  const [pendingPriceMax, setPendingPriceMax] = useState('2000');

  const togglePendingCategory = (cat: string) => {
    setPendingCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePendingCondition = (cond: string) => {
    setPendingConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const togglePendingMaterial = (mat: string) => {
    setPendingMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const togglePendingColor = (col: string) => {
    setPendingColors(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const togglePendingWeightRange = (range: string) => {
    setPendingWeightRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const applyFilters = () => {
    setSelectedCategories(pendingCategories);
    setSelectedConditions(pendingConditions);
    setSelectedMaterials(pendingMaterials);
    setSelectedColors(pendingColors);
    setSelectedWeightRanges(pendingWeightRanges);
    const minPrice = Math.max(0, parseInt(pendingPriceMin) || 0);
    const maxPrice = Math.min(10000, parseInt(pendingPriceMax) || 2000);
    setPriceRange([minPrice, maxPrice]);
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  // Keep legacy toggle functions for removing active filter badges
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const newVal = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
      setPendingCategories(newVal);
      return newVal;
    });
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => {
      const newVal = prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond];
      setPendingConditions(newVal);
      return newVal;
    });
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => {
      const newVal = prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat];
      setPendingMaterials(newVal);
      return newVal;
    });
  };

  const toggleColor = (col: string) => {
    setSelectedColors(prev => {
      const newVal = prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col];
      setPendingColors(newVal);
      return newVal;
    });
  };

  const toggleWeightRange = (range: string) => {
    setSelectedWeightRanges(prev => {
      const newVal = prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range];
      setPendingWeightRanges(newVal);
      return newVal;
    });
  };

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(product.condition);
      const matchesMaterial = selectedMaterials.length === 0 || (product.material && selectedMaterials.includes(product.material));
      const matchesColor = selectedColors.length === 0 || (product.color && selectedColors.includes(product.color));
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      let matchesWeight = true;
      if (selectedWeightRanges.length > 0 && product.weight) {
        matchesWeight = selectedWeightRanges.some(rangeLabel => {
          const range = weightRanges.find(r => r.label === rangeLabel);
          return range && product.weight! >= range.min && product.weight! <= range.max;
        });
      } else if (selectedWeightRanges.length > 0 && !product.weight) {
        matchesWeight = false;
      }
      
      return matchesSearch && matchesCategory && matchesCondition && matchesMaterial && matchesColor && matchesPrice && matchesWeight;
    });
  }, [search, selectedCategories, selectedConditions, selectedMaterials, selectedColors, selectedWeightRanges, priceRange]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, selectedConditions, selectedMaterials, selectedColors, selectedWeightRanges, priceRange]);

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
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedWeightRanges([]);
    setPriceRange([0, 2000]);
    setPendingCategories([]);
    setPendingConditions([]);
    setPendingMaterials([]);
    setPendingColors([]);
    setPendingWeightRanges([]);
    setPendingPriceMin('0');
    setPendingPriceMax('2000');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedConditions.length > 0 || 
    selectedMaterials.length > 0 || selectedColors.length > 0 || selectedWeightRanges.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < 2000;

  const hasPendingChanges = 
    JSON.stringify(pendingCategories) !== JSON.stringify(selectedCategories) ||
    JSON.stringify(pendingConditions) !== JSON.stringify(selectedConditions) ||
    JSON.stringify(pendingMaterials) !== JSON.stringify(selectedMaterials) ||
    JSON.stringify(pendingColors) !== JSON.stringify(selectedColors) ||
    JSON.stringify(pendingWeightRanges) !== JSON.stringify(selectedWeightRanges) ||
    parseInt(pendingPriceMin) !== priceRange[0] ||
    parseInt(pendingPriceMax) !== priceRange[1];

  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4 pb-2 border-b border-border mb-4">
        <p className="font-semibold text-foreground">{t.catalog.price || 'Price'} (₼)</p>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={pendingPriceMin}
            onChange={(e) => setPendingPriceMin(e.target.value)}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={pendingPriceMax}
            onChange={(e) => setPendingPriceMax(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Categories */}
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          {t.catalog.category}
          {categoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${cat}`}
                checked={pendingCategories.includes(cat)}
                onCheckedChange={() => togglePendingCategory(cat)}
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
                checked={pendingConditions.includes(cond)}
                onCheckedChange={() => togglePendingCondition(cond)}
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

      {/* Materials */}
      <Collapsible open={materialOpen} onOpenChange={setMaterialOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Material
          </span>
          {materialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {materials.map((mat) => (
            <div key={mat} className="flex items-center space-x-3">
              <Checkbox
                id={`mat-${mat}`}
                checked={pendingMaterials.includes(mat)}
                onCheckedChange={() => togglePendingMaterial(mat)}
              />
              <Label
                htmlFor={`mat-${mat}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors capitalize"
              >
                {mat}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Colors */}
      <Collapsible open={colorOpen} onOpenChange={setColorOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color
          </span>
          {colorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {colors.map((col) => (
            <div key={col} className="flex items-center space-x-3">
              <Checkbox
                id={`col-${col}`}
                checked={pendingColors.includes(col)}
                onCheckedChange={() => togglePendingColor(col)}
              />
              <Label
                htmlFor={`col-${col}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors capitalize flex items-center gap-2"
              >
                <span 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ 
                    backgroundColor: col === 'brown' ? '#8B4513' : 
                      col === 'beige' ? '#F5F5DC' : 
                      col === 'gray' ? '#808080' : col 
                  }} 
                />
                {col}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Weight */}
      <Collapsible open={weightOpen} onOpenChange={setWeightOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            Weight
          </span>
          {weightOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {weightRanges.map((range) => (
            <div key={range.label} className="flex items-center space-x-3">
              <Checkbox
                id={`weight-${range.label}`}
                checked={pendingWeightRanges.includes(range.label)}
                onCheckedChange={() => togglePendingWeightRange(range.label)}
              />
              <Label
                htmlFor={`weight-${range.label}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Apply Filters Button */}
      <Button variant="hero" onClick={applyFilters} className="w-full mt-4">
        Apply Filters
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
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
                {selectedMaterials.map((mat) => (
                  <Badge
                    key={mat}
                    variant="secondary"
                    className="cursor-pointer gap-1 capitalize"
                    onClick={() => toggleMaterial(mat)}
                  >
                    {mat}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedColors.map((col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="cursor-pointer gap-1 capitalize"
                    onClick={() => toggleColor(col)}
                  >
                    {col}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedWeightRanges.map((range) => (
                  <Badge
                    key={range}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleWeightRange(range)}
                  >
                    {range}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => setPriceRange([0, 2000])}
                  >
                    ₼{priceRange[0]} - ₼{priceRange[1]}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
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