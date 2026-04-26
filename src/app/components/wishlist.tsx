import { Heart, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ProductCard } from './product-card';

interface WishlistProps {
  onBack: () => void;
}

export function Wishlist({ onBack }: WishlistProps) {
  const { favorites, removeFavorite } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="text-[14px]">Back</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Heart size={28} className="text-[var(--crimson)] fill-[var(--crimson)]" />
            <h1 className="font-[var(--font-serif)] text-4xl text-[var(--charcoal)]">
              My Favorites
            </h1>
          </div>

          <p className="text-[15px] text-[var(--light-gray)]">
            {favorites.length === 0
              ? 'You haven\'t liked any products yet'
              : `You have ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg">
            <Heart size={48} className="text-[var(--light-gray)] mx-auto mb-4 opacity-50" />
            <h2 className="text-[18px] text-[var(--charcoal)] mb-2">
              No Favorites Yet
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-6">
              Start adding products to your favorites to see them here!
            </p>
            <button
              onClick={onBack}
              className="inline-block h-12 px-10 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard {...product} />
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-[var(--crimson)] text-white flex items-center justify-center rounded-full hover:bg-[var(--charcoal)] transition-colors z-10"
                  title="Remove from favorites"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

