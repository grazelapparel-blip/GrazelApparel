import { useState } from 'react';
import { Search, Heart, User, ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { UserAuth } from './user-auth';
import { routes, navigateTo } from '../App';

interface HeaderProps {
  onLogout?: () => void | Promise<void>;
  onSearch?: () => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onProducts?: () => void;
  onNavigation?: (category: string) => void;
  onFilterNavigation?: (filterType: string, filterValue: string, gender?: string) => void;
}

export function Header({ onLogout, onSearch, onWishlist, onCart, onProducts, onNavigation, onFilterNavigation }: HeaderProps) {
  const { currentUser } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { 
      label: 'Men',
      path: '/men',
      subcategories: {
        'Categories': ['Shirts', 'Trousers', 'Knitwear', 'Outerwear', 'Suits'],
        'Fabric': ['Cotton', 'Linen', 'Wool', 'Cashmere', 'Silk'],
        'Fit': ['Slim', 'Regular', 'Relaxed'],
        'Occasion': ['Casual', 'Business', 'Evening', 'Weekend']
      }
    },
    { 
      label: 'Women',
      path: '/women',
      subcategories: {
        'Categories': ['Dresses', 'Blouses', 'Trousers', 'Knitwear', 'Outerwear'],
        'Fabric': ['Cotton', 'Linen', 'Wool', 'Cashmere', 'Silk'],
        'Fit': ['Slim', 'Regular', 'Relaxed'],
        'Occasion': ['Casual', 'Business', 'Evening', 'Weekend']
      }
    },
    { label: 'Essentials', path: '/essentials' },
    { label: 'New In', path: '/new-in' },
    { label: 'Collections', path: '/collections' }
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-[var(--border)]">
      {/* Top Utility Bar */}
      <div className="bg-[var(--cream)] border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-end gap-6 h-10">
            {/*<a href="#" className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">*/}
            {/*  Store Locator*/}
            {/*</a>*/}
            <a href="#" className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">
              Help
            </a>
            <a href="#" className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">
              Orders & Returns
            </a>
            <div className="relative">
              {currentUser ? (
                <>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors flex items-center gap-1"
                  >
                    <User size={14} />
                    {currentUser?.name.split(' ')[0]}
                  </button>
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="text-[12px] text-gray-600 uppercase tracking-wide">Signed in as</p>
                        <p className="text-[14px] font-medium text-[var(--charcoal)]">{currentUser?.email}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full px-4 py-2 text-left text-[13px] text-red-600 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors flex items-center gap-1"
                >
                  <User size={14} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => navigateTo('/')} 
              className="font-[var(--font-serif)] text-[22px] trackingn-wide text-[var(--charcoal)] bg-transparent border-none cursor-pointer"
            >
              GRAZEL APPAREL
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.subcategories && setActiveMegaMenu(item.label)}
              >
                <button
                  onClick={() => {
                    // Use direct URL navigation with routes
                    if (item.path) {
                      navigateTo(item.path);
                    } else {
                      onNavigation?.(item.label);
                    }
                  }}
                  className="text-[14px] tracking-wide text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors py-4 block relative cursor-pointer bg-transparent border-none"
                >
                  {item.label}
                  {activeMegaMenu === item.label && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--crimson)]" />
                  )}
                </button>
              </div>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setShowSearchBox(!showSearchBox);
                if (!showSearchBox) setSearchQuery('');
              }}
              className="hidden lg:block text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              title="Search products"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => {
                if (currentUser) {
                  onWishlist?.();
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="hidden lg:block text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              title="View wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => {
                if (currentUser) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="hidden lg:block text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              title={currentUser ? "Account" : "Sign In"}
            >
              <User size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => {
                if (currentUser) {
                  onCart?.();
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              title="View shopping cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
            </button>
            <button 
              className="lg:hidden text-[var(--charcoal)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      {activeMegaMenu && navItems.find(item => item.label === activeMegaMenu)?.subcategories && (
        <div
          className="absolute left-0 right-0 bg-[var(--cream)] border-t border-b border-[var(--border)] shadow-sm z-40"
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="grid grid-cols-4 gap-12">
              {Object.entries(navItems.find(item => item.label === activeMegaMenu)?.subcategories || {}).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-[var(--font-serif)] text-[15px] mb-4 text-[var(--charcoal)]">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => {
                            // Map category names to filter types
                            let filterType = 'category';
                            if (category === 'Fabric') filterType = 'fabric';
                            else if (category === 'Fit') filterType = 'fit';
                            else if (category === 'Occasion') filterType = 'category';
                            else if (category === 'Categories') filterType = 'category';
                            
                            // Pass the current menu's gender (Men/Women) along with the filter
                            const currentGender = activeMegaMenu;
                            onFilterNavigation?.(filterType, item, currentGender === 'Men' || currentGender === 'Women' ? currentGender : undefined);
                            setActiveMegaMenu(null);
                          }}
                          className="text-[14px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors block bg-transparent border-none cursor-pointer text-left"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 bg-[var(--cream)] border-b border-[var(--border)] max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            <div className="flex gap-4">
              <button className="flex-1 bg-white border border-[var(--border)] h-12 flex items-center justify-center text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button className="flex-1 bg-white border border-[var(--border)] h-12 flex items-center justify-center text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">
                <Heart size={20} strokeWidth={1.5} />
              </button>
              <button className="flex-1 bg-white border border-[var(--border)] h-12 flex items-center justify-center text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors">
                <User size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    // Use direct URL navigation with routes
                    if (item.path) {
                      navigateTo(item.path);
                    } else {
                      onNavigation?.(item.label);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-3 text-[16px] text-[var(--charcoal)] border-b border-[var(--border)] hover:text-[var(--crimson)] transition-colors bg-none border-none cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--cream)] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 text-gray-500 rounded-full z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <UserAuth onSuccess={() => setShowLoginModal(false)} />
            </div>
          </div>
        </div>
      )}

      {showSearchBox && (
        <div className="bg-white border-b border-[var(--border)]">
          <div className="max-w-[1440px] mx-auto px-6 py-4">
            <div className="flex items-center gap-2">
              <Search size={20} className="text-[var(--charcoal)]" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onSearch?.();
                    setShowSearchBox(false);
                    setSearchQuery('');
                  }
                }}
                className="flex-1 outline-none text-[14px] text-[var(--charcoal)] placeholder-gray-400"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearchBox(false);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
