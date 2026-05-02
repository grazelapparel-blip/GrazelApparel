import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { signUpUser, signInUser, signOutUser, getCurrentSession } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Types
export interface PackagingOption {
  id: string;
  name: 'simple' | 'elegant' | 'premium' | 'gift';
  label: string;
  description: string;
  price: number;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requestedDate: string;
  resolvedDate?: string;
}

export interface NavigationMenuItem {
  id: string;
  label: string;
  path: string;
  isActive: boolean;
  order: number;
}

export interface UserAnalytics {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  frequencyScore: number; // 0-100
  returnRate: number;
  averageOrderValue: number;
}

export interface Product {
  id: string;
  name: string;
  price: number; // In Indian Rupees (₹)
  image: string;
  fabric: string;
  fit: string;
  category?: string;
  size?: string[];
  gender?: string;
  isEssential?: boolean;
  isHighlight?: boolean;
  isTop?: boolean;
  isBottom?: boolean;
  offerPercentage?: number;
  season?: string;
  festival?: string;
  stock: number; // Available quantity
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedPackaging?: PackagingOption;
  userId?: string; // Track which user owns this cart item
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  joinedDate: string;
  address?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  isFrequentCustomer?: boolean;
  lastPurchaseDate?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  packagingPrice?: number;
  packaging?: PackagingOption;
  status: 'ordered' | 'acknowledged' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  returns?: ReturnRecord[];
}

export interface FitProfile {
  id?: string;
  userId: string;
  preferredSize: string;
  bodyType?: string;
  height: string;
  weight: string;
  chest?: string;
  waist?: string;
  hips?: string;
  preferredFit: 'slim' | 'regular' | 'relaxed';
  notes?: string;
  createdAt?: string;
}

interface AppState {
  users: User[];
  orders: Order[];
  cartItems: CartItem[];
  products: Product[];
  fitProfiles: FitProfile[];
  favorites: Product[];
  returns: ReturnRecord[];
  navigationMenu: NavigationMenuItem[];
  packagingOptions: PackagingOption[];
  currentUser: User | null;
  isAdmin: boolean;
}

interface AppContextType extends AppState {
  addToCart: (product: Product, size: string, quantity: number, packaging?: PackagingOption) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: () => Order | null;
  setCurrentUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  saveFitProfile: (profile: Omit<FitProfile, 'userId' | 'createdAt'>) => void;
  // Favorite/Wishlist operations
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  // Fit Profile operations
  getFitProfiles: () => Promise<void>;
  addFitProfile: (profile: Omit<FitProfile, 'createdAt'>) => Promise<void>;
  updateFitProfile: (userId: string, profile: Partial<Omit<FitProfile, 'userId' | 'createdAt'>>) => Promise<void>;
  deleteFitProfile: (userId: string) => Promise<void>;
  // User authentication
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  // Admin CRUD operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  deleteOrder: (id: string) => void;
  // Stock management
  updateStock: (productId: string, quantity: number) => void;
  getAvailableStock: (productId: string) => number;
  // Packaging management
  addPackagingOption: (option: Omit<PackagingOption, 'id'>) => void;
  updatePackagingOption: (id: string, option: Partial<PackagingOption>) => void;
  deletePackagingOption: (id: string) => void;
  // Returns management
  requestReturn: (orderId: string, productId: string, reason: string) => void;
  updateReturnStatus: (returnId: string, status: ReturnRecord['status']) => void;
  deleteReturn: (returnId: string) => void;
  getOrderReturns: (orderId: string) => ReturnRecord[];
  // Navigation management
  updateNavigationMenu: (menu: NavigationMenuItem[]) => void;
  addNavMenuItem: (item: Omit<NavigationMenuItem, 'id'>) => void;
  updateNavMenuItem: (id: string, item: Partial<NavigationMenuItem>) => void;
  deleteNavMenuItem: (id: string) => void;
  // User analytics
  getUserAnalytics: (userId: string) => UserAnalytics | null;
  getFrequentUsers: (minOrders: number) => User[];
  getUserActivity: () => UserAnalytics[];
  getReturnStats: () => { totalReturns: number; approvedReturns: number; returnRate: number };
}

// Mock data
const mockUsers: User[] = [];

const mockProducts: Product[] = [];

const mockOrders: Order[] = [];

const mockFitProfiles: FitProfile[] = [];

const mockPackagingOptions: PackagingOption[] = [
  { id: 'pkg-1', name: 'simple', label: 'Simple Package', description: 'Basic packaging', price: 0 },
  { id: 'pkg-2', name: 'elegant', label: 'Elegant Package', description: 'Premium wrapping', price: 50 },
  { id: 'pkg-3', name: 'premium', label: 'Premium Package', description: 'Luxury packaging with ribbons', price: 100 },
  { id: 'pkg-4', name: 'gift', label: 'Gift Package', description: 'Special gift wrapping', price: 150 }
];

const mockNavigationMenu: NavigationMenuItem[] = [
  { id: 'nav-1', label: 'Men', path: '/men', isActive: true, order: 1 },
  { id: 'nav-2', label: 'Women', path: '/women', isActive: true, order: 2 },
  { id: 'nav-3', label: 'Essentials', path: '/essentials', isActive: true, order: 3 },
  { id: 'nav-4', label: 'New In', path: '/new-in', isActive: true, order: 4 },
  { id: 'nav-5', label: 'Collections', path: '/collections', isActive: true, order: 5 }
];

const mockReturns: ReturnRecord[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Generate unique session ID for THIS INSTANCE ONLY (per tab/window)
  // Use useRef to ensure it's created once per mount and doesn't change on re-renders
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const SESSION_ID = sessionIdRef.current;

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [fitProfiles, setFitProfiles] = useState<FitProfile[]>(mockFitProfiles);
  const [returns, setReturns] = useState<ReturnRecord[]>(mockReturns);
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>(mockPackagingOptions);
  const [navigationMenu, setNavigationMenu] = useState<NavigationMenuItem[]>(mockNavigationMenu);
  const [favorites, setFavorites] = useState<Product[]>(() => {
    // Don't load on init - will load after user logs in
    return [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Use sessionStorage for THIS TAB ONLY (not shared across tabs)
    const saved = sessionStorage.getItem(`currentUser_${SESSION_ID}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Set up Firebase auth listener on mount
  useEffect(() => {
    // First restore from sessionStorage (per-tab with unique SESSION_ID)
    const saved = sessionStorage.getItem(`currentUser_${SESSION_ID}`);
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }

    // Listen for Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(user);
        // Use sessionStorage - each tab has its own session
        sessionStorage.setItem(`currentUser_${SESSION_ID}`, JSON.stringify(user));
      } else {
        setCurrentUser(null);
        sessionStorage.removeItem(`currentUser_${SESSION_ID}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist current user to sessionStorage when it changes (per-tab only)
  useEffect(() => {
    if (currentUser) {
      // Store in sessionStorage with SESSION_ID - unique per tab
      sessionStorage.setItem(`currentUser_${SESSION_ID}`, JSON.stringify(currentUser));

      // Load user-specific favorites (uses user ID as key)
      const favKey = `favorites_${currentUser.id}`;
      const saved = localStorage.getItem(favKey);
      setFavorites(saved ? JSON.parse(saved) : []);

      // Load user-specific cart items (uses user ID as key)
      const cartKey = `cart_${currentUser.id}`;
      const cartSaved = localStorage.getItem(cartKey);
      if (cartSaved) {
        setCartItems(JSON.parse(cartSaved));
      }
    } else {
      // Remove this tab's session
      sessionStorage.removeItem(`currentUser_${SESSION_ID}`);
      // Clear favorites and cart when user logs out
      setFavorites([]);
      setCartItems([]);
    }
  }, [currentUser]);

  // Persist cart items to user-specific localStorage when they change
  useEffect(() => {
    if (currentUser) {
      const userCartItems = cartItems.filter(item => item.userId === currentUser.id);
      const cartKey = `cart_${currentUser.id}`;
      localStorage.setItem(cartKey, JSON.stringify(userCartItems));
    }
  }, [cartItems, currentUser]);

  // Fetch products from Firebase on mount
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        if (mounted) {
          await fetchProductsFromSupabase();
          await fetchUsersFromSupabase();
        }
      } catch (err) {
        console.error('[Store] Error initializing data:', err);
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, []); // Only run on mount

  const fetchProductsFromSupabase = async () => {
    // Fetch products from Firebase
    const mockProducts: Product[] = [];

    try {
      const { getProducts } = await import('../../lib/firebase');
      const firebaseProducts = await getProducts({ isActive: true });

      if (!firebaseProducts || firebaseProducts.length === 0) {
        console.log('[Store] No products found in Firebase database.');
        setProducts([]);
        return;
      }

      // Successfully fetched from Firebase
      console.log('[Store] Successfully fetched products from Firebase');

      // Convert Firebase products to app format
      const convertedProducts = firebaseProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        fabric: p.fabric,
        fit: p.fit,
        category: p.category,
        size: p.sizes,
        gender: p.gender,
        isEssential: p.isEssential,
        isHighlight: p.isHighlight,
        isTop: p.isTop,
        isBottom: p.isBottom,
        offerPercentage: p.offerPercentage,
        season: p.season,
        festival: p.festival,
        createdAt: p.createdAt
      }));

      setProducts(convertedProducts);
    } catch (err: any) {
      // Detailed error logging for debugging
      const errorMsg = err?.message || err?.toString() || 'Unknown error';

      if (errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error('[Store] DNS resolution failed - Firebase cannot be reached');
        console.error('[Store] Possible causes:');
        console.error('  1. Firebase project may be inactive');
        console.error('  2. Network DNS issues');
        console.error('  3. Firewall/Network restrictions');
      } else if (errorMsg.includes('ERR_NETWORK_CHANGED') || errorMsg.includes('NetworkError')) {
        console.error('[Store] Network connection issue - unable to reach Firebase');
      } else if (errorMsg.includes('AbortError')) {
        console.error('[Store] Firebase request timeout - server not responding');
      } else {
        console.error('[Store] Failed to fetch products from Firebase:', errorMsg);
      }

      setProducts(mockProducts);
    }
  };

  const fetchUsersFromSupabase = async () => {
    try {
      // Create an abort controller with 15-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const { getAllUsers } = await import('../../lib/firebase');
      const firebaseUsers = await getAllUsers();

      clearTimeout(timeoutId);

      if (firebaseUsers && firebaseUsers.length > 0) {
        // Convert Firebase users to app format
        const convertedUsers = firebaseUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          joinedDate: u.joinedDate
        }));
        
        console.log('[Store] Successfully fetched users from Firebase');
        setUsers(convertedUsers);
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.toString() || 'Unknown error';

      if (errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
        console.error('[Store] Cannot fetch users: DNS resolution failed');
      } else if (errorMsg.includes('AbortError')) {
        console.error('[Store] Cannot fetch users: Request timeout');
      } else {
        console.error('[Store] Failed to fetch users from Firebase:', errorMsg);
      }
      // Keep existing users
    }
  };

  const addToCart = (product: Product, size: string, quantity: number, packaging?: PackagingOption) => {
    // Only add to cart if user is logged in
    if (!currentUser) {
      console.warn('User must be logged in to add to cart');
      return;
    }

    setCartItems(prev => {
      // Filter to only this user's cart items
      const userCartItems = prev.filter(item => item.userId === currentUser.id);
      const existing = userCartItems.find(item => item.id === product.id && item.selectedSize === size);

      if (existing) {
        // Update existing item for this user
        return prev.map(item =>
          item.userId === currentUser.id && item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity, selectedPackaging: packaging }
            : item
        );
      }

      // Add new item with userId tracking
      return [...prev, { ...product, selectedSize: size, quantity, userId: currentUser.id, selectedPackaging: packaging }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!currentUser) return;
    // Only remove this user's items
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.userId === currentUser.id)));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (!currentUser) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId && item.userId === currentUser.id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    if (!currentUser) return;
    // Only clear this user's cart
    setCartItems(prev => prev.filter(item => item.userId !== currentUser.id));
  };

  const createOrder = (): Order | null => {
    if (!currentUser) return null;

    // Get only this user's cart items
    const userCartItems = cartItems.filter(item => item.userId === currentUser.id);
    if (userCartItems.length === 0) return null;

    // Calculate packaging cost (use first item's packaging if available)
    const packaging = userCartItems[0].selectedPackaging;
    const packagingPrice = packaging?.price || 0;

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      items: [...userCartItems],
      total: userCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + packagingPrice,
      packagingPrice: packagingPrice,
      packaging: packaging,
      status: 'ordered',
      createdAt: new Date().toISOString(),
      shippingAddress: currentUser.address || {
        street: '',
        city: '',
        postcode: '',
        country: 'United Kingdom'
      },
      returns: []
    };
    
    // Update stock for each item
    userCartItems.forEach(item => {
      updateStock(item.id, -item.quantity);
    });

    // Update user's last purchase date
    const updatedUser = { ...currentUser, lastPurchaseDate: new Date().toISOString().split('T')[0] };
    setCurrentUser(updatedUser);
    updateUser(currentUser.id, { lastPurchaseDate: updatedUser.lastPurchaseDate });
    
    setOrders(prev => [...prev, newOrder]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const saveFitProfile = (profile: Omit<FitProfile, 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    
    const newProfile: FitProfile = {
      ...profile,
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    
    setFitProfiles(prev => {
      const existing = prev.findIndex(p => p.userId === currentUser.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newProfile;
        return updated;
      }
      return [...prev, newProfile];
    });
  };

  // Favorite/Wishlist operations
  const toggleFavorite = (product: Product) => {
    if (!currentUser) return;

    setFavorites(prev => {
      const isFav = prev.some(p => p.id === product.id);
      let updated: Product[];
      if (isFav) {
        updated = prev.filter(p => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      // Save to user-specific localStorage key
      const favKey = `favorites_${currentUser.id}`;
      localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some(p => p.id === productId);
  };

  const removeFavorite = (productId: string) => {
    if (!currentUser) return;

    setFavorites(prev => {
      const updated = prev.filter(p => p.id !== productId);
      const favKey = `favorites_${currentUser.id}`;
      localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearFavorites = () => {
    if (!currentUser) return;
    setFavorites([]);
    const favKey = `favorites_${currentUser.id}`;
    localStorage.removeItem(favKey);
  };

  // User Authentication with Firebase
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, session } = await signInUser(email, password);
      if (user) {
        const appUser: User = {
          id: user.id,
          name: user.user_metadata?.name || email.split('@')[0],
          email: user.email || email,
          joinedDate: user.created_at || new Date().toISOString().split('T')[0]
        };
        setCurrentUser(appUser);
        setIsAdmin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await signUpUser(email, password, name);
      if (user) {
        const appUser: User = {
          id: user.id,
          name: name,
          email: user.email || email,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [...prev, appUser]);
        setCurrentUser(appUser);
        setIsAdmin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
    setCartItems([]);
    setIsAdmin(false);
  };

  // Admin CRUD Operations for Products
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { createProduct } = await import('../../lib/firebase');
      
      // Prepare data for Firebase
      const firebaseProduct = {
        name: product.name,
        price: product.price,
        imageUrl: product.image,
        fabric: product.fabric,
        fit: product.fit,
        category: product.category,
        sizes: product.size || [],
        sku: `SKU-${Date.now()}`,
        isActive: true,
        description: '',
        gender: product.gender,
        isEssential: product.isEssential || false,
        isHighlight: product.isHighlight || false,
        isTop: product.isTop || false,
        isBottom: product.isBottom || false,
        offerPercentage: product.offerPercentage || 0,
        season: product.season || '',
        festival: product.festival || ''
      };

      const result = await createProduct(firebaseProduct);
      
      if (result) {
        // Immediately add the product to state
        const newProduct: Product = {
          ...product,
          id: result.id
        };
        setProducts(prev => [...prev, newProduct]);

        // Refetch to ensure all data is synced
        setTimeout(() => fetchProductsFromSupabase(), 500);
      }
    } catch (err: any) {
      console.error('Failed to add product to Firebase:', err?.message || err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { updateProduct: updateFirebaseProduct } = await import('../../lib/firebase');
      
      // Immediately update UI for instant feedback
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...updates } : product
        )
      );

      // Prepare data for Firebase
      const firebaseUpdates = {
        name: updates.name,
        price: updates.price,
        imageUrl: updates.image,
        fabric: updates.fabric,
        fit: updates.fit,
        category: updates.category,
        sizes: updates.size,
        gender: updates.gender,
        isEssential: updates.isEssential,
        isHighlight: updates.isHighlight,
        isTop: updates.isTop,
        isBottom: updates.isBottom,
        offerPercentage: updates.offerPercentage,
        season: updates.season,
        festival: updates.festival
      };

      await updateFirebaseProduct(id, firebaseUpdates);
      
      // Refresh products after successful update
      setTimeout(() => fetchProductsFromSupabase(), 500);
    } catch (err) {
      console.error('Failed to update product:', err);
      // Refresh products on error
      await fetchProductsFromSupabase();
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { deleteProduct: deleteFirebaseProduct } = await import('../../lib/firebase');
      
      // Immediately remove from UI for instant feedback
      setProducts(prev => prev.filter(product => product.id !== id));

      // Delete from Firebase
      await deleteFirebaseProduct(id);
      
      // Refetch to ensure consistency
      setTimeout(() => fetchProductsFromSupabase(), 500);
    } catch (err: any) {
      console.error('Failed to delete product:', err?.message || err);
      // If there's an error, refresh to restore the product
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchProductsFromSupabase();
    }
  };

  const deleteAllProducts = async () => {
    try {
      const { deleteProduct: deleteFirebaseProduct, getProducts } = await import('../../lib/firebase');
      
      // Immediately clear UI for instant feedback
      setProducts([]);

      // Get all products
      const allProducts = await getProducts();
      
      // Delete each product
      if (allProducts && allProducts.length > 0) {
        for (const product of allProducts) {
          try {
            await deleteFirebaseProduct(product.id);
          } catch (err) {
            console.error('Error deleting product:', product.id, err);
          }
        }
      }
      
      // Verify deletion
      await new Promise(resolve => setTimeout(resolve, 800));
      await fetchProductsFromSupabase();
    } catch (err) {
      console.error('Failed to delete all products:', err);
      // Keep products cleared from UI even on error
      setProducts([]);
    }
  };

  // Admin CRUD Operations for Users
  const addUser = (user: Omit<User, 'id' | 'joinedDate'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also delete user's orders and fit profile
    setOrders(prev => prev.filter(order => order.userId !== id));
    setFitProfiles(prev => prev.filter(profile => profile.userId !== id));
  };

  // Admin Delete Operations for Orders
  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  // Fit Profile Operations (Local Storage)
  const getFitProfiles = async () => {
    try {
      // Load from localStorage
      const saved = localStorage.getItem('fitProfiles');
      if (saved) {
        setFitProfiles(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to fetch fit profiles:', err);
    }
  };

  const addFitProfile = async (profile: Omit<FitProfile, 'createdAt'>) => {
    try {
      const newProfile: FitProfile = {
        ...profile,
        id: `fp-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setFitProfiles(prev => [...prev, newProfile]);
      localStorage.setItem('fitProfiles', JSON.stringify([...fitProfiles, newProfile]));
    } catch (err) {
      console.error('Failed to add fit profile:', err);
    }
  };

  const updateFitProfile = async (userId: string, profile: Partial<Omit<FitProfile, 'userId' | 'createdAt'>>) => {
    try {
      const updated = fitProfiles.map(p =>
        p.userId === userId ? { ...p, ...profile } : p
      );
      setFitProfiles(updated);
      localStorage.setItem('fitProfiles', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update fit profile:', err);
    }
  };

  // Admin Delete Operations for Fit Profiles
  const deleteFitProfile = async (userId: string) => {
    try {
      const updated = fitProfiles.filter(profile => profile.userId !== userId);
      setFitProfiles(updated);
      localStorage.setItem('fitProfiles', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete fit profile:', err);
    }
  };

  // Stock Management
  const updateStock = (productId: string, quantityChange: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, stock: Math.max(0, product.stock + quantityChange) }
          : product
      )
    );
  };

  const getAvailableStock = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    return product?.stock || 0;
  };

  // Packaging Management
  const addPackagingOption = (option: Omit<PackagingOption, 'id'>) => {
    const newOption: PackagingOption = {
      ...option,
      id: `pkg-${Date.now()}`
    };
    setPackagingOptions(prev => [...prev, newOption]);
  };

  const updatePackagingOption = (id: string, option: Partial<PackagingOption>) => {
    setPackagingOptions(prev =>
      prev.map(pkg =>
        pkg.id === id ? { ...pkg, ...option } : pkg
      )
    );
  };

  const deletePackagingOption = (id: string) => {
    setPackagingOptions(prev => prev.filter(pkg => pkg.id !== id));
  };

  // Returns Management
  const requestReturn = (orderId: string, productId: string, reason: string) => {
    if (!currentUser) return;

    const newReturn: ReturnRecord = {
      id: `RET-${Date.now()}`,
      orderId,
      userId: currentUser.id,
      productId,
      reason,
      status: 'requested',
      requestedDate: new Date().toISOString().split('T')[0]
    };

    setReturns(prev => [...prev, newReturn]);
    
    // Add return record to order
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, returns: [...(order.returns || []), newReturn] }
          : order
      )
    );
  };

  const updateReturnStatus = (returnId: string, status: ReturnRecord['status']) => {
    setReturns(prev =>
      prev.map(ret =>
        ret.id === returnId
          ? {
              ...ret,
              status,
              resolvedDate: ['approved', 'rejected', 'completed'].includes(status)
                ? new Date().toISOString().split('T')[0]
                : ret.resolvedDate
            }
          : ret
      )
    );
  };

  const deleteReturn = (returnId: string) => {
    setReturns(prev => prev.filter(ret => ret.id !== returnId));
    setOrders(prev =>
      prev.map(order => ({
        ...order,
        returns: (order.returns || []).filter(ret => ret.id !== returnId)
      }))
    );
  };

  const getOrderReturns = (orderId: string): ReturnRecord[] => {
    return returns.filter(ret => ret.orderId === orderId);
  };

  // Navigation Menu Management
  const updateNavigationMenu = (menu: NavigationMenuItem[]) => {
    setNavigationMenu(menu);
    localStorage.setItem('navigationMenu', JSON.stringify(menu));
  };

  const addNavMenuItem = (item: Omit<NavigationMenuItem, 'id'>) => {
    const newItem: NavigationMenuItem = {
      ...item,
      id: `nav-${Date.now()}`
    };
    const updated = [...navigationMenu, newItem].sort((a, b) => a.order - b.order);
    updateNavigationMenu(updated);
  };

  const updateNavMenuItem = (id: string, item: Partial<NavigationMenuItem>) => {
    const updated = navigationMenu.map(nav =>
      nav.id === id ? { ...nav, ...item } : nav
    );
    updateNavigationMenu(updated);
  };

  const deleteNavMenuItem = (id: string) => {
    const updated = navigationMenu.filter(nav => nav.id !== id);
    updateNavigationMenu(updated);
  };

  // User Analytics
  const getUserAnalytics = (userId: string): UserAnalytics | null => {
    const userOrders = orders.filter(o => o.userId === userId);
    const userReturns = returns.filter(r => r.userId === userId);

    if (userOrders.length === 0) return null;

    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrderDate = userOrders[userOrders.length - 1]?.createdAt;
    const averageOrderValue = totalSpent / userOrders.length;
    const frequencyScore = Math.min(100, userOrders.length * 10); // 0-100 scale
    const approvedReturns = userReturns.filter(r => r.status === 'approved').length;
    const returnRate = userReturns.length > 0 ? (approvedReturns / userReturns.length) * 100 : 0;

    return {
      userId,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate,
      frequencyScore,
      returnRate,
      averageOrderValue
    };
  };

  const getFrequentUsers = (minOrders: number): User[] => {
    return users.filter(user => {
      const userOrders = orders.filter(o => o.userId === user.id);
      return userOrders.length >= minOrders;
    });
  };

  const getUserActivity = (): UserAnalytics[] => {
    return users
      .map(user => getUserAnalytics(user.id))
      .filter((analytics): analytics is UserAnalytics => analytics !== null)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  };

  const getReturnStats = () => {
    const totalReturns = returns.length;
    const approvedReturns = returns.filter(r => r.status === 'approved').length;
    const returnRate = totalReturns > 0 ? (approvedReturns / totalReturns) * 100 : 0;

    return {
      totalReturns,
      approvedReturns,
      returnRate
    };
  };

  return (
    <AppContext.Provider
      value={{
        users,
        orders,
        cartItems,
        products,
        fitProfiles,
        favorites,
        returns,
        navigationMenu,
        packagingOptions,
        currentUser,
        isAdmin,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        setCurrentUser,
        setIsAdmin,
        updateOrderStatus,
        saveFitProfile,
        // Favorite/Wishlist operations
        toggleFavorite,
        isFavorite,
        removeFavorite,
        clearFavorites,
        // Fit Profile operations
        getFitProfiles,
        addFitProfile,
        updateFitProfile,
        deleteFitProfile,
        // User authentication
        loginUser,
        registerUser,
        logoutUser,
        // Admin CRUD
        addProduct,
        updateProduct,
        deleteProduct,
        deleteAllProducts,
        addUser,
        updateUser,
        deleteUser,
        deleteOrder,
        // Stock management
        updateStock,
        getAvailableStock,
        // Packaging management
        addPackagingOption,
        updatePackagingOption,
        deletePackagingOption,
        // Returns management
        requestReturn,
        updateReturnStatus,
        deleteReturn,
        getOrderReturns,
        // Navigation management
        updateNavigationMenu,
        addNavMenuItem,
        updateNavMenuItem,
        deleteNavMenuItem,
        // User analytics
        getUserAnalytics,
        getFrequentUsers,
        getUserActivity,
        getReturnStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
