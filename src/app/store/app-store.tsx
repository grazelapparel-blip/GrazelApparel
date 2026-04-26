import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { signUpUser, signInUser, signOutUser, getCurrentSession } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
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
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
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
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
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
  favorites: Product[]; // Array of favorite/liked products
  currentUser: User | null;
  isAdmin: boolean;
}

interface AppContextType extends AppState {
  addToCart: (product: Product, size: string, quantity: number) => void;
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
}

// Mock data
const mockUsers: User[] = [];

const mockProducts: Product[] = [];

const mockOrders: Order[] = [];

const mockFitProfiles: FitProfile[] = [];

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
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  // Set up Supabase auth listener on mount
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

  // Fetch products from Supabase on mount and set up real-time listener
  useEffect(() => {
    let mounted = true;
    let productSubscription: any = null;

    const initializeData = async () => {
      try {
        await fetchProductsFromSupabase();
        await fetchUsersFromSupabase();

        if (mounted && supabaseConnected) {
          // Only set up real-time subscription if Supabase is connected
          try {
            productSubscription = supabase
              .channel('products')
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                  // Refetch products when any change occurs
                  if (mounted) {
                    fetchProductsFromSupabase();
                  }
                }
              )
              .subscribe((status) => {
                if (status === 'SUBSCRIPTION_ERROR' || status === 'CHANNEL_ERROR') {
                  console.warn('[Store] WebSocket subscription failed - realtime updates disabled');
                  // Don't set supabaseConnected to false - REST API still works
                }
              });
          } catch (err) {
            console.warn('[Store] Could not set up WebSocket subscription:', err);
            setSupabaseConnected(false);
          }
        }
      } catch (err) {
        console.error('[Store] Error initializing data:', err);
      }
    };

    initializeData();

    // No polling - only fetch on mount and real-time updates
    // Polling was causing excessive API calls

    return () => {
      mounted = false;
      if (productSubscription) {
        try {
          productSubscription.unsubscribe();
        } catch (err) {
          console.warn('[Store] Error unsubscribing from WebSocket:', err);
        }
      }
    };
  }, []); // Only run on mount - removed supabaseConnected to prevent infinite loop

  const fetchProductsFromSupabase = async () => {
    // Empty mock products - products will come from Firebase only
    const mockProducts: Product[] = [];

    try {
      const { getProducts } = await import('../../lib/firebase');
      const firebaseProducts = await getProducts({ isActive: true });

      if (!firebaseProducts || firebaseProducts.length === 0) {
        console.log('[Store] No products found in Firebase database.');
        setSupabaseConnected(true);
        setProducts([]);
        return;
      }

      // Successfully fetched from Firebase
      setSupabaseConnected(true);
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

      setSupabaseConnected(false);
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

  const addToCart = (product: Product, size: string, quantity: number) => {
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
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item with userId tracking
      return [...prev, { ...product, selectedSize: size, quantity, userId: currentUser.id }];
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

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      items: [...userCartItems],
      total: userCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: currentUser.address || {
        street: '',
        city: '',
        postcode: '',
        country: 'United Kingdom'
      }
    };
    
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

  // User Authentication with Supabase
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
      // Fallback to local users if Supabase fails
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
        return true;
      }
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
      // Fallback to local registration if Supabase fails
      const emailExists = users.some(u => u.email === email);
      if (emailExists) return false;

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAdmin(false);
      return true;
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

  // Fit Profile Operations
  const getFitProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('fit_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching fit profiles:', error);
        return;
      }

      if (data) {
        const profiles = data.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          preferredSize: p.preferred_size,
          bodyType: p.body_type,
          height: p.height,
          weight: p.weight,
          preferredFit: p.preferred_fit,
          notes: p.notes,
          createdAt: p.created_at
        }));
        setFitProfiles(profiles as any);
        console.log('Fit profiles fetched:', profiles);
      }
    } catch (err) {
      console.error('Failed to fetch fit profiles:', err);
    }
  };

  const addFitProfile = async (profile: Omit<FitProfile, 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('fit_profiles')
        .insert([
          {
            user_id: profile.userId,
            preferred_size: profile.preferredSize,
            body_type: profile.bodyType || '',
            height: profile.height || '',
            weight: profile.weight || '',
            preferred_fit: profile.preferredFit || 'regular',
            notes: profile.notes || ''
          }
        ])
        .select();

      if (error) {
        console.error('Error adding fit profile:', error);
      } else if (data && data.length > 0) {
        const newProfile: FitProfile = {
          id: data[0].id,
          userId: data[0].user_id,
          preferredSize: data[0].preferred_size,
          bodyType: data[0].body_type,
          height: data[0].height,
          weight: data[0].weight,
          preferredFit: data[0].preferred_fit,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        setFitProfiles(prev => [...prev, newProfile]);
        console.log('Fit profile added successfully:', newProfile);
      }
    } catch (err) {
      console.error('Failed to add fit profile:', err);
    }
  };

  const updateFitProfile = async (userId: string, profile: Partial<Omit<FitProfile, 'userId' | 'createdAt'>>) => {
    try {
      const { error } = await supabase
        .from('fit_profiles')
        .update({
          preferred_size: profile.preferredSize,
          body_type: profile.bodyType,
          height: profile.height,
          weight: profile.weight,
          preferred_fit: profile.preferredFit,
          notes: profile.notes || ''
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating fit profile:', error);
      } else {
        setFitProfiles(prev =>
          prev.map(p =>
            p.userId === userId ? { ...p, ...profile } : p
          )
        );
        await getFitProfiles();
      }
    } catch (err) {
      console.error('Failed to update fit profile:', err);
    }
  };

  // Admin Delete Operations for Fit Profiles
  const deleteFitProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('fit_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting fit profile:', error);
      } else {
        setFitProfiles(prev => prev.filter(profile => profile.userId !== userId));
      }
    } catch (err) {
      console.error('Failed to delete fit profile:', err);
    }
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
        deleteOrder
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
