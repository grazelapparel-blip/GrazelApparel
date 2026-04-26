import { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from './product-card';
import { ScrollAnimation } from './scroll-animation';
import { useAppStore, Product } from '../store/app-store';

interface ProductListingProps {
  onProductClick: (product: Product) => void;
  initialFilter?: { type: string; value: string; gender?: string } | null;
  onFilterApplied?: () => void;
}

export function ProductListing({ onProductClick, initialFilter, onFilterApplied }: ProductListingProps) {
  const { products } = useAppStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFestivalFilter, setSelectedFestivalFilter] = useState<string>('all');
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    fabric: string[];
    fit: string[];
    size: string[];
    price: string[];
    gender: string[];
    festival: string[];
    essentials: boolean;
    newIn: boolean;
  }>({
    category: [],
    fabric: [],
    fit: [],
    size: [],
    price: [],
    gender: [],
    festival: [],
    essentials: false,
    newIn: false
  });
  const [sortBy, setSortBy] = useState('new');

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      const { type, value } = initialFilter;
      
      if (type === 'essentials') {
        setSelectedFilters(prev => ({
          ...prev,
          category: [],
          fabric: [],
          fit: [],
          size: [],
          price: [],
          gender: [],
          festival: [],
          essentials: true,
          newIn: false
        }));
      } else if (type === 'newIn' || type === 'new_in') {
        setSelectedFilters(prev => ({
          ...prev,
          category: [],
          fabric: [],
          fit: [],
          size: [],
          price: [],
          gender: [],
          festival: [],
          essentials: false,
          newIn: true
        }));
      } else if (type === 'gender') {
        setSelectedFilters(prev => ({
          ...prev,
          category: [],
          fabric: [],
          fit: [],
          size: [],
          price: [],
          gender: [value],
          festival: [],
          essentials: false,
          newIn: false
        }));
      } else {
        // Map the filter value to match our filter options
        let filterValue = value;
        if (type === 'fit' && !value.includes('Fit')) {
          filterValue = value + ' Fit';
        }
        
        // Also apply gender filter if provided
        const genderFilter = initialFilter.gender ? [initialFilter.gender] : [];
        
        setSelectedFilters(prev => ({
          ...prev,
          category: [],
          fabric: [],
          fit: [],
          size: [],
          price: [],
          gender: genderFilter,
          festival: [],
          essentials: false,
          newIn: false,
          [type]: [filterValue]
        }));
      }
      
      onFilterApplied?.();
    }
  }, [initialFilter, onFilterApplied]);

  const filters = {
    gender: ['Men', 'Women', 'Unisex'],
    category: ['Shirts', 'Trousers', 'Knitwear', 'Outerwear', 'Dresses'],
    fabric: ['Cotton', 'Wool', 'Linen', 'Cashmere', 'Silk'],
    fit: ['Slim Fit', 'Regular Fit', 'Relaxed Fit'],
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    price: ['Under ₹200', '₹200-₹400', '₹400-₹600', 'Over ₹600'],
    festival: ['Diwali', 'Holi', 'Eid', 'Christmas', 'New Year', 'Pongal', 'Onam', 'Durga Puja', 'Wedding', 'Party']
  };

  // Festival options for top filter bar
  const festivalOptions = [
    { id: 'all', label: 'All Festivals' },
    { id: 'Diwali', label: 'Diwali' },
    { id: 'Holi', label: 'Holi' },
    { id: 'Eid', label: 'Eid' },
    { id: 'Christmas', label: 'Christmas' },
    { id: 'New Year', label: 'New Year' },
    { id: 'Pongal', label: 'Pongal' },
    { id: 'Onam', label: 'Onam' },
    { id: 'Durga Puja', label: 'Durga Puja' },
    { id: 'Wedding', label: 'Wedding' },
    { id: 'Party', label: 'Party' }
  ];

  const toggleFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      if (filterType === 'essentials' || filterType === 'newIn') {
        return {
          ...prev,
          [filterType]: !(prev[filterType] as boolean)
        };
      }
      const filterArray = prev[filterType] as string[];
      if (!Array.isArray(filterArray)) {
        return prev;
      }
      return {
        ...prev,
        [filterType]: filterArray.includes(value)
          ? filterArray.filter(v => v !== value)
          : [...filterArray, value]
      };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      fabric: [],
      fit: [],
      size: [],
      price: [],
      gender: [],
      festival: [],
      essentials: false,
      newIn: false
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some((val) => {
    if (typeof val === 'boolean') return val;
    return (val as string[]).length > 0;
  });

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Essentials filter
    if (selectedFilters.essentials && !product.isEssential) {
      return false;
    }
    // New In filter (products added today)
    if (selectedFilters.newIn) {
      if (!product.createdAt) return false;
      const productDate = new Date(product.createdAt).toDateString();
      const todayDate = new Date().toDateString();
      if (productDate !== todayDate) {
        return false;
      }
    }
    // Category filter
    if (selectedFilters.category.length > 0 && (!product.category || !selectedFilters.category.includes(product.category))) {
      return false;
    }
    // Gender filter - Unisex products show in both Men and Women
    if (selectedFilters.gender.length > 0) {
      const productGender = product.gender?.toLowerCase();
      const isUnisex = productGender === 'unisex';
      const matchesSelectedGender = selectedFilters.gender.some(g => 
        productGender === g.toLowerCase()
      );
      // Show product if it matches selected gender OR if it's Unisex (and Men or Women is selected)
      if (!matchesSelectedGender && !isUnisex) {
        return false;
      }
    }
    // Fabric filter
    if (selectedFilters.fabric.length > 0 && !selectedFilters.fabric.includes(product.fabric)) {
      return false;
    }
    // Fit filter
    if (selectedFilters.fit.length > 0 && !selectedFilters.fit.includes(product.fit)) {
      return false;
    }
    // Size filter
    if (selectedFilters.size.length > 0 && !selectedFilters.size.some(size => product.size?.includes(size))) {
      return false;
    }
    // Price filter
    if (selectedFilters.price.length > 0) {
      const matchesPrice = selectedFilters.price.some(priceRange => {
        if (priceRange === 'Under ₹200') return product.price < 200;
        if (priceRange === '₹200-₹400') return product.price >= 200 && product.price <= 400;
        if (priceRange === '₹400-₹600') return product.price > 400 && product.price <= 600;
        if (priceRange === 'Over ₹600') return product.price > 600;
        return false;
      });
      if (!matchesPrice) return false;
    }
    // Festival filter (sidebar checkboxes OR top filter bar)
    const festivalFilterActive = selectedFilters.festival.length > 0 || selectedFestivalFilter !== 'all';
    if (festivalFilterActive) {
      const matchesSidebarFestival = selectedFilters.festival.length === 0 || 
        (product.festival && selectedFilters.festival.includes(product.festival));
      const matchesTopFestival = selectedFestivalFilter === 'all' || 
        product.festival?.toLowerCase() === selectedFestivalFilter.toLowerCase();
      if (!matchesSidebarFestival || !matchesTopFestival) {
        return false;
      }
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popular':
        return 0; // Keep original order for now
      case 'new':
      default:
        return 0; // Keep original order for new arrivals
    }
  });

  const FilterSection = ({ title, options, filterKey }: { title: string; options: string[]; filterKey: keyof typeof selectedFilters }) => (
    <div className="pb-6 border-b border-[var(--border)]">
      <h3 className="font-[var(--font-serif)] text-[15px] mb-4 text-[var(--charcoal)]">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={(selectedFilters[filterKey] as string[]).includes(option)}
              onChange={() => toggleFilter(filterKey, option)}
              className="w-4 h-4 border border-[var(--border)] text-[var(--crimson)] focus:ring-[var(--crimson)] focus:ring-1"
            />
            <span className="text-[14px] text-[var(--charcoal)] group-hover:text-[var(--crimson)] transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[var(--font-serif)] text-4xl mb-2 text-[var(--charcoal)]">All Products</h1>
        <p className="text-[14px] text-[var(--light-gray)]">{sortedProducts.length} of {products.length} items</p>
      </div>

      {/* Festival Filter Bar - Only shown on New In page */}
      {selectedFilters.newIn && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {festivalOptions.map((festival) => (
              <button
                key={festival.id}
                onClick={() => setSelectedFestivalFilter(festival.id)}
                className={`px-4 py-2 text-xs tracking-wide border transition-colors ${
                  selectedFestivalFilter === festival.id
                    ? 'bg-[var(--charcoal)] text-white border-[var(--charcoal)]'
                    : 'bg-white text-[var(--charcoal)] border-[var(--border)] hover:border-[var(--charcoal)]'
                }`}
              >
                {festival.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6 flex gap-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex-1 h-12 border border-[var(--border)] bg-white flex items-center justify-center gap-2 text-[14px] text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          Filters {hasActiveFilters && `(${Object.values(selectedFilters).flat().length})`}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-12 px-4 border border-[var(--border)] bg-white text-[14px] text-[var(--charcoal)] focus:outline-none focus:border-[var(--crimson)]"
        >
          <option value="new">New Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <div className="flex gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[13px] text-[var(--crimson)] hover:underline mb-4"
              >
                Clear all filters
              </button>
            )}
            <FilterSection title="Gender" options={filters.gender} filterKey="gender" />
            <FilterSection title="Category" options={filters.category} filterKey="category" />
            <FilterSection title="Fabric" options={filters.fabric} filterKey="fabric" />
            <FilterSection title="Fit" options={filters.fit} filterKey="fit" />
            <FilterSection title="Size" options={filters.size} filterKey="size" />
            <FilterSection title="Price" options={filters.price} filterKey="price" />
            <FilterSection title="Festival" options={filters.festival} filterKey="festival" />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(selectedFilters).flatMap(([key, values]) => {
                    if (key === 'essentials' && values === true) {
                      return (
                        <span
                          key="essentials-true"
                          className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--crimson)] text-[var(--crimson)] text-[13px]"
                        >
                          Essentials
                          <button onClick={() => toggleFilter('essentials', '')}>
                            <X size={14} />
                          </button>
                        </span>
                      );
                    }
                    if (key === 'newIn' && values === true) {
                      return (
                        <span
                          key="newIn-true"
                          className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--crimson)] text-[var(--crimson)] text-[13px]"
                        >
                          New In
                          <button onClick={() => toggleFilter('newIn', '')}>
                            <X size={14} />
                          </button>
                        </span>
                      );
                    }
                    if (Array.isArray(values)) {
                      return values.map(value => (
                        <span
                          key={`${key}-${value}`}
                          className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--crimson)] text-[var(--crimson)] text-[13px]"
                        >
                          {value}
                          <button onClick={() => toggleFilter(key as keyof typeof selectedFilters, value)}>
                            <X size={14} />
                          </button>
                        </span>
                      ));
                    }
                    return [];
                  })}
                </div>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-4 border border-[var(--border)] bg-white text-[14px] text-[var(--charcoal)] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product, index) => (
                <ScrollAnimation 
                  key={product.id} 
                  animation="fade-up"
                  delay={index * 100}
                  duration={500}
                >
                  <div className="cursor-pointer h-full">
                    <ProductCard {...product} onQuickView={() => onProductClick(product)} />
                  </div>
                </ScrollAnimation>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-[var(--charcoal)] text-lg mb-2">No products found</p>
                <p className="text-[var(--light-gray)] text-[14px] mb-4">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-[var(--crimson)] text-[14px] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--cream)] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={24} className="text-[var(--charcoal)]" />
                </button>
              </div>
              <div className="space-y-6">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[13px] text-[var(--crimson)] hover:underline mb-4"
                  >
                    Clear all filters
                  </button>
                )}
                <FilterSection title="Gender" options={filters.gender} filterKey="gender" />
                <FilterSection title="Category" options={filters.category} filterKey="category" />
                <FilterSection title="Fabric" options={filters.fabric} filterKey="fabric" />
                <FilterSection title="Fit" options={filters.fit} filterKey="fit" />
                <FilterSection title="Size" options={filters.size} filterKey="size" />
                <FilterSection title="Price" options={filters.price} filterKey="price" />
                <FilterSection title="Festival" options={filters.festival} filterKey="festival" />
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide mt-6"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
