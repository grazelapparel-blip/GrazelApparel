import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ImageLightbox } from './image-lightbox';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  fabric?: string;
  fit?: string;
  gender?: string;
  isEssential?: boolean;
  offerPercentage?: number;
  stock?: number;
  onQuickView?: () => void;
}

export function ProductCard({ id, name, price, image, fabric, fit, gender, isEssential, offerPercentage, stock = 0, onQuickView }: ProductCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useAppStore();

  const favorited = isFavorite(id);

  const handleLikeClick = () => {
    const product = { id, name, price, image, fabric, fit, gender, isEssential, offerPercentage };
    toggleFavorite(product);
  };

  return (
    <>
      <div className="group relative bg-white">
        {/* Image Container */}
        <div 
          className="relative aspect-[3/4] mb-4 overflow-hidden bg-[var(--cream)] cursor-pointer"
          onMouseEnter={() => setIsLightboxOpen(true)}
        >
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Hover Overlay with Icon */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </div>
          
          {/* Offer Badge */}
          {offerPercentage && offerPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-[var(--crimson)] text-white px-3 py-1 text-[12px] font-medium animate-bounce">
              {offerPercentage}% OFF
            </div>
          )}
          
          {/* Essential Badge */}
          {isEssential && (
            <div className="absolute top-4 right-14 bg-green-600 text-white px-3 py-1 text-[12px] font-medium">
              ESSENTIAL
            </div>
          )}

          {/* Stock Status Badge */}
          {stock !== undefined && (
            <div className={`absolute bottom-4 left-4 px-3 py-1 text-[12px] font-medium text-white ${
              stock > 10 ? 'bg-green-600' : stock > 0 ? 'bg-amber-500' : 'bg-red-600'
            }`}>
              {stock > 10 ? '✓ In Stock' : stock > 0 ? `${stock} Left` : 'Out of Stock'}
            </div>
          )}
        
        {/* Favorite Heart - Always Visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeClick();
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-20 border border-gray-200"
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={favorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}
          />
        </button>
        <button
          onClick={onQuickView}
          className="absolute bottom-4 left-4 right-4 h-12 bg-[var(--crimson)] text-white text-[13px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
        >
          Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] text-[var(--charcoal)] tracking-wide flex-1">
            {name}
          </h3>
          {gender && (
            <span className="text-[11px] bg-gray-200 text-[var(--charcoal)] px-2 py-1 whitespace-nowrap">
              {gender}
            </span>
          )}
        </div>
        {(fabric || fit) && (
          <p className="text-[12px] text-[var(--light-gray)]">
            {[fabric, fit].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-[15px] text-[var(--crimson)] mt-2">
          ₹{price.toFixed(2)}
        </p>
      </div>
    </div>

      {/* Image Lightbox */}
      <ImageLightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={image}
        productName={name}
      />
    </>
  );
}
