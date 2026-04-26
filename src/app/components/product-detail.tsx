import { useState } from 'react';
import { Heart, Ruler, TruckIcon, RotateCcw, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollAnimation } from './scroll-animation';
import { Product } from '../store/app-store';

interface ProductDetailProps {
  product: Product | null;
  onFitIntelligenceClick: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

export function ProductDetail({ product, onFitIntelligenceClick, onAddToCart }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Show empty state if no product is selected
  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <p className="text-[18px] font-[var(--font-serif)] text-[var(--charcoal)] mb-4">
              No Product Selected
            </p>
            <p className="text-[14px] text-[var(--light-gray)]">
              Select a product from the listing to view details
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <ScrollAnimation animation="slide-left" duration={600}>
          <div>
            <div className="sticky top-24 space-y-4">
              <div className="aspect-[3/4] bg-white overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Product Information */}
        <ScrollAnimation animation="slide-right" duration={600} delay={100}>
          <div className="bg-[var(--cream)] p-8 lg:p-12">
            {/* Title & Price */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-[var(--font-serif)] text-4xl text-[var(--charcoal)] flex-1">
                  {product.name}
                </h1>
                <div className="flex flex-col gap-2">
                  {product.gender && (
                    <span className="text-[12px] bg-gray-300 text-[var(--charcoal)] px-3 py-1 text-center">
                      {product.gender}
                    </span>
                  )}
                  {product.isEssential && (
                    <span className="text-[12px] bg-green-600 text-white px-3 py-1 text-center">
                      ESSENTIAL
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-[24px] text-[var(--crimson)]">
                  ₹{product.price.toFixed(2)}
                </p>
                {product.offerPercentage && product.offerPercentage > 0 && (
                  <span className="text-[16px] bg-[var(--crimson)] text-white px-3 py-1 animate-bounce">
                    {product.offerPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Fit Intelligence Entry */}
            <button
              onClick={onFitIntelligenceClick}
              className="w-full h-14 mb-8 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Ruler size={18} strokeWidth={1.5} />
              Refine Fit for Your Body
            </button>

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[var(--font-serif)] text-[17px] text-[var(--charcoal)]">
                  Select Size
                </h3>
                <button className="text-[13px] text-[var(--crimson)] hover:underline">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.size && product.size.length > 0 ? (
                product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border text-[14px] transition-all ${
                      selectedSize === size
                        ? 'border-[var(--crimson)] bg-[var(--crimson)] text-white'
                        : 'border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)]'
                    }`}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <p className="text-[14px] text-[var(--light-gray)]">No sizes available</p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-4 text-[var(--charcoal)]">
              Quantity
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-[15px] text-[var(--charcoal)]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3 mb-12">
            <button
              onClick={() => {
                if (selectedSize) {
                  onAddToCart(product, selectedSize, quantity);
                  setSelectedSize(null);
                  setQuantity(1);
                }
              }}
              disabled={!selectedSize}
              className="flex-1 h-14 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button className="w-14 h-14 border border-[var(--border)] bg-white flex items-center justify-center hover:border-[var(--crimson)] transition-colors">
              <Heart size={20} strokeWidth={1.5} className="text-[var(--charcoal)]" />
            </button>
          </div>

          {/* Fabric Details */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Fabric: {product.fabric}
            </h3>
            <p className="text-[14px] text-[var(--charcoal)] leading-relaxed">
              {product.fabric ? `Premium ${product.fabric} fabric for superior quality and comfort.` : 'No fabric details available.'}
            </p>
          </div>

          {/* Fit Details */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Fit & Silhouette: {product.fit}
            </h3>
            <p className="text-[14px] text-[var(--charcoal)] leading-relaxed">
              {product.fit ? `This item features a ${product.fit} silhouette for optimal comfort and style.` : 'No fit details available.'}
            </p>
          </div>

          {/* Service Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <TruckIcon size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Free Delivery</p>
              <p className="text-[11px] text-[var(--light-gray)]">Orders over ₹200</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Easy Returns</p>
              <p className="text-[11px] text-[var(--light-gray)]">30 day return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Quality Guarantee</p>
              <p className="text-[11px] text-[var(--light-gray)]">Lifetime craftsmanship</p>
            </div>
          </div>
        </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}


