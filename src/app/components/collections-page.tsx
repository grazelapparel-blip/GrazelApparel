import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollAnimation } from './scroll-animation';

interface CollectionsPageProps {
  onProductClick?: (product: any) => void;
  onShowMore?: (category: string) => void;
}

// Season options for the filter
const seasons = [
  { id: 'all', label: 'All Seasons' },
  { id: 'summer', label: 'Summer' },
  { id: 'winter', label: 'Winter' },
  { id: 'spring', label: 'Spring' },
  { id: 'autumn', label: 'Autumn' }
];

// Collection sections data
const collectionSections = [
  {
    id: 'men',
    category: 'Men',
    title: "Men's Collection",
    subtitle: 'Discover',
    description: 'From tailored blazers to premium cashmere, explore our curated collection of menswear designed with timeless elegance and modern sophistication.',
    bgColor: 'bg-[#f8f6f3]',
    carouselBg: 'bg-[#f8f6f3]'
  },
  {
    id: 'women',
    category: 'Women',
    title: "Women's Collection",
    subtitle: 'Discover',
    description: 'Elegant sophistication meets contemporary design. Our womenswear collection celebrates individuality with carefully selected pieces for every occasion.',
    bgColor: 'bg-[#f8f6f3]',
    carouselBg: 'bg-[#f8f6f3]'
  }
];

export function CollectionsPage({ onProductClick, onShowMore }: CollectionsPageProps) {
  const { products, toggleFavorite, isFavorite } = useAppStore();

  // Season filter state
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // Get products for a specific gender filtered by season
  // Men section: (gender is Men OR Unisex) AND isHighlight is true
  // Women section: (gender is Women OR Unisex) AND isHighlight is true
  const getCategoryProducts = (category: string) => {
    return products.filter(p => {
      const productGender = p.gender?.toLowerCase();
      const targetGender = category.toLowerCase();
      // Product must be highlighted AND (gender matches target OR is unisex)
      const genderMatch = productGender === targetGender || productGender === 'unisex';
      const isHighlighted = p.isHighlight === true;
      const seasonMatch = selectedSeason === 'all' || 
        p.season?.toLowerCase() === selectedSeason.toLowerCase();
      return genderMatch && isHighlighted && seasonMatch;
    });
  };

  // Carousel navigation for specific section
  const handleScrollLeft = (carouselId: string) => {
    const container = document.getElementById(carouselId);
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const handleScrollRight = (carouselId: string) => {
    const container = document.getElementById(carouselId);
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product: any) => {
    onProductClick?.(product);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Page Header with Season Filter */}
      <div className="bg-white py-6 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">Collections</h1>
              <p className="text-gray-500 text-sm mt-1">Explore our curated collections</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-wider text-gray-500">FILTER BY SEASON:</span>
              <div className="flex flex-wrap gap-2">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.id)}
                    className={`px-4 py-2 text-xs tracking-wide transition-all ${
                      selectedSeason === season.id
                        ? 'bg-[var(--charcoal)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Sections */}
      {collectionSections.map((section, sectionIndex) => {
        const sectionProducts = getCategoryProducts(section.category);
        const carouselId = `carousel-${section.id}`;

        return (
          <ScrollAnimation 
            key={section.id}
            animation={sectionIndex % 2 === 0 ? 'slide-left' : 'slide-right'}
            duration={700}
            delay={sectionIndex * 100}
          >
            <div className={section.bgColor}>
              {/* Section Content */}
              <div className="flex flex-col lg:flex-row min-h-[550px]">
                {/* Left Side - Collection Info */}
                <div className={`w-full lg:w-[380px] ${section.bgColor} p-8 lg:p-12 flex flex-col justify-center`}>
                  <div className="mb-8">
                    <p className="text-sm tracking-widest text-gray-600 mb-2">{section.subtitle}</p>
                    <h2 className="font-[var(--font-serif)] text-3xl lg:text-4xl text-[var(--charcoal)] mb-6">
                      {section.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    {section.description}
                  </p>
                  <button 
                    onClick={() => onShowMore?.(section.category)}
                    className="text-sm tracking-wider text-[var(--charcoal)] border-b border-[var(--charcoal)] pb-1 hover:text-[var(--crimson)] hover:border-[var(--crimson)] transition-colors"
                  >
                    EXPLORE NOW
                  </button>
                </div>

                {/* Product Count */}
                <div className="mt-auto">
                  <p className="text-xs tracking-wider text-gray-500">
                    {sectionProducts.length} {sectionProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'} AVAILABLE
                  </p>
                </div>
              </div>

              {/* Right Side - Products Carousel */}
              <div className={`flex-1 relative ${section.carouselBg} overflow-hidden`}>
                {/* Navigation Arrows */}
                {sectionProducts.length > 0 && (
                  <>
                    <button
                      onClick={() => handleScrollLeft(carouselId)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={24} className="text-gray-800" />
                    </button>
                    <button
                      onClick={() => handleScrollRight(carouselId)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight size={24} className="text-gray-800" />
                    </button>
                  </>
                )}

                {/* Products Container */}
                <div
                  id={carouselId}
                  className="flex gap-6 overflow-x-auto scrollbar-hide h-full py-8 px-16"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {sectionProducts.length > 0 ? (
                    sectionProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="flex-shrink-0 w-[300px] lg:w-[350px] cursor-pointer group"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        {/* Product Card */}
                        <div className="relative h-[420px] lg:h-[480px] overflow-hidden bg-gray-200">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Discount Badge */}
                          {product.offerPercentage && product.offerPercentage > 0 && (
                            <div className="absolute top-4 left-4 bg-[var(--crimson)] text-white px-3 py-1.5 text-sm font-medium">
                              {product.offerPercentage}% OFF
                            </div>
                          )}

                          {/* Season Badge */}
                          {product.season && (
                            <div className="absolute top-4 right-16 bg-white/90 text-gray-800 px-3 py-1.5 text-xs tracking-wider uppercase">
                              {product.season}
                            </div>
                          )}

                          {/* Favorite Heart */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product);
                            }}
                            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-20 border border-gray-200"
                            title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart
                              size={20}
                              strokeWidth={2}
                              className={isFavorite(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                            />
                          </button>

                          {/* Product Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 transition-all duration-300 group-hover:pb-16">
                            {/* Brand/Category Label */}
                            <div className="mb-3">
                              <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-1">
                                GRAZELAPPAREL
                              </p>
                              <p className="text-white/60 text-xs tracking-wider uppercase">
                                {product.category}
                              </p>
                            </div>

                            {/* Product Name */}
                            <h3 className="font-[var(--font-serif)] text-xl text-white mb-2">
                              {product.name}
                            </h3>

                            {/* Product Details */}
                            <p className="text-white/70 text-sm mb-3">
                              {[product.fabric, product.fit].filter(Boolean).join(' • ')}
                            </p>

                            {/* Price */}
                            <p className="text-white text-lg font-medium">
                              ₹{product.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quick View Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            className="absolute bottom-0 left-0 right-0 h-12 bg-[var(--crimson)] text-white text-[13px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--crimson)]/90 z-10"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full h-[420px]">
                      <p className="text-gray-500 text-lg">No products found for this selection.</p>
                    </div>
                  )}
                </div>

                {/* Carousel Indicator */}
                {sectionProducts.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {sectionProducts.slice(0, Math.min(5, sectionProducts.length)).map((_, index) => (
                      <div
                        key={index}
                        className={`w-8 h-1 rounded-full transition-all ${
                          index === 0 ? 'bg-[var(--charcoal)]' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                    {sectionProducts.length > 5 && (
                      <span className="text-xs text-gray-500 ml-2">+{sectionProducts.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </ScrollAnimation>
        );
      })}

      {/* All Products Section */}
      <div className="bg-[#f8f6f3] py-16 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-10">
            <p className="text-sm tracking-widest text-gray-600 mb-2">Browse</p>
            <h2 className="font-[var(--font-serif)] text-3xl lg:text-4xl text-[var(--charcoal)] mb-4">
              All Products
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              Explore our complete collection of premium apparel, from tailored menswear to elegant womenswear.
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter(p => selectedSeason === 'all' || p.season?.toLowerCase() === selectedSeason.toLowerCase())
                .map((product, index) => (
                  <ScrollAnimation
                    key={product.id}
                    animation="fade-up"
                    delay={index * 80}
                    duration={500}
                  >
                    <div
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer group"
                    >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Discount Badge */}
                      {product.offerPercentage && product.offerPercentage > 0 && (
                        <div className="absolute top-3 left-3 bg-[var(--crimson)] text-white px-2 py-1 text-xs font-medium">
                          {product.offerPercentage}% OFF
                        </div>
                      )}

                      {/* Favorite Heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-20 border border-gray-200"
                        title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          size={20}
                          strokeWidth={2}
                          className={isFavorite(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                        />
                      </button>

                      {/* Season Badge */}
                      {product.season && (
                        <div className="absolute top-12 right-3 bg-white/90 text-gray-800 px-2 py-1 text-xs tracking-wider uppercase">
                          {product.season}
                        </div>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="absolute bottom-4 left-4 right-4 h-12 bg-[var(--crimson)] text-white text-[13px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--crimson)]/90"
                      >
                        Quick View
                      </button>
                    </div>

                    {/* Product Info */}
                    <div>
                      <p className="text-xs tracking-wider text-gray-500 uppercase mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-[var(--font-serif)] text-lg text-[var(--charcoal)] mb-1 group-hover:text-[var(--crimson)] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        {[product.fabric, product.fit].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-[var(--charcoal)] font-medium">
                        ₹{product.price.toFixed(2)}
                      </p>
                    </div>
                    </div>
                  </ScrollAnimation>
                ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

