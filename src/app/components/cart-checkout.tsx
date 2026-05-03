import { Minus, Plus, X, Lock, Gift } from 'lucide-react';
import { useState } from 'react';
import { useAppStore, PackagingOption } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartCheckoutProps {
  onContinueShopping: () => void;
}

export function CartCheckout({ onContinueShopping }: CartCheckoutProps) {
  const { cartItems, removeFromCart, updateCartQuantity, createOrder, packagingOptions } = useAppStore();
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption | undefined>(packagingOptions[0]);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    const order = createOrder();
    if (order) {
      alert(`Order placed successfully! Order ID: ${order.id}\n\nThank you for your purchase!`);
      onContinueShopping();
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
  const packagingCost = selectedPackaging?.price || 0;
  const total = subtotal + shippingCost + packagingCost;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <h1 className="font-[var(--font-serif)] text-4xl mb-8 text-[var(--charcoal)]">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-[15px] text-[var(--light-gray)] mb-6">
                Your cart is empty
              </p>
              <button
                onClick={onContinueShopping}
                className="h-12 px-10 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 flex gap-6">
                  <div className="w-32 h-40 flex-shrink-0 bg-[var(--cream)] overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[16px] text-[var(--charcoal)] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[13px] text-[var(--light-gray)]">
                          {item.fabric} · {item.fit} · Size {item.selectedSize || item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
                        title="Remove from cart"
                      >
                        <X size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-[var(--border)] flex items-center justify-center hover:border-[var(--crimson)] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-[14px] text-[var(--charcoal)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-[var(--border)] flex items-center justify-center hover:border-[var(--crimson)] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-[17px] text-[var(--crimson)]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white p-8 sticky top-24 space-y-6">
            <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">
              Order Summary
            </h2>

            {/* Packaging Selection */}
            <div className="pb-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <Gift size={18} className="text-[var(--crimson)]" />
                <label className="text-[14px] font-medium text-[var(--charcoal)]">
                  Choose Packaging
                </label>
              </div>
              <div className="space-y-2">
                {packagingOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:border-[var(--crimson)] transition-colors">
                    <input
                      type="radio"
                      name="packaging"
                      checked={selectedPackaging?.id === option.id}
                      onChange={() => setSelectedPackaging(option)}
                      className="w-4 h-4 text-[var(--crimson)]"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[var(--charcoal)]">{option.label}</p>
                      <p className="text-[12px] text-gray-500">{option.description}</p>
                    </div>
                    <span className="text-[13px] font-medium text-[var(--crimson)]">
                      {option.price > 0 ? `+₹${option.price}` : 'Free'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--charcoal)]">Subtotal</span>
                <span className="text-[var(--charcoal)]">₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--charcoal)]">Shipping</span>
                <span className="text-[var(--charcoal)]">
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-[12px] text-[var(--light-gray)]">
                  Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for free delivery
                </p>
              )}
              {packagingCost > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--charcoal)]">Packaging</span>
                  <span className="text-[var(--charcoal)]">+₹{packagingCost}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--border)]">
              <span className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">
                Total
              </span>
              <span className="font-[var(--font-serif)] text-[20px] text-[var(--crimson)]">
                ₹{total.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full h-14 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>

            <button
              onClick={onContinueShopping}
              className="w-full h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
            >
              Continue Shopping
            </button>

            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <div className="flex items-start gap-3 text-[12px] text-[var(--charcoal)]">
                <Lock size={16} className="text-[var(--crimson)] flex-shrink-0" strokeWidth={1.5} />
                <p>Secure checkout with SSL encryption</p>
              </div>
              <p className="text-[12px] text-[var(--light-gray)] pl-7">
                30-day return policy on all items
              </p>
              <p className="text-[12px] text-[var(--light-gray)] pl-7">
                ✓ Prices in Indian Rupees (₹)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
