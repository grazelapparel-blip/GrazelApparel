import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch,
  orderBy,
  limit,
  QueryConstraint,
  collectionGroup,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    'Firebase credentials not configured. Please set environment variables:\n' +
    'VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, ' +
    'VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ===== TYPE DEFINITIONS =====

export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  joined_date?: string;
  created_at?: string;
  updated_at?: string;
  is_frequent_customer?: boolean;
  last_purchase_date?: string;
  total_orders?: number;
  total_spent?: number;
  role?: string;
}

export interface FirebaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  fabric: string;
  fit: string;
  gender?: string;
  category?: string;
  size: string[];
  stock?: number;
  currency_code?: string;
  offer_percentage?: number;
  is_essential?: boolean;
  is_active?: boolean;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FirebaseOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: 'ordered' | 'acknowledged' | 'shipping' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  shipping_street?: string;
  shipping_city?: string;
  shipping_postcode?: string;
  shipping_country?: string;
  billing_street?: string;
  billing_city?: string;
  billing_postcode?: string;
  billing_country?: string;
  notes?: string;
  packaging_id?: string;
  packaging_price?: number;
  created_at?: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface FirebaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  selected_size?: string;
  created_at?: string;
}

export interface FirebaseCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  selected_packaging?: string;
  added_at?: string;
  updated_at?: string;
}

export interface FirebasePackagingOption {
  id: string;
  name: string;
  label: string;
  description?: string;
  price: number;
  currency_code?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FirebaseOrderReturn {
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requested_date?: string;
  resolved_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FirebaseNavigationMenuItem {
  id: string;
  label: string;
  path: string;
  is_active?: boolean;
  menu_order?: number;
  icon_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FirebaseUserAnalytics {
  id: string;
  user_id: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  frequency_score?: number;
  return_count?: number;
  average_order_value?: number;
  return_rate?: number;
  created_at?: string;
  updated_at?: string;
}

// ===== AUTH FUNCTIONS =====

export async function signUpUser(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with name
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      name,
      role: 'customer',
      joined_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_orders: 0,
      total_spent: 0,
      is_frequent_customer: false
    });

    return { user, uid: user.uid };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getCurrentUser() {
  return auth.currentUser;
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== USER FUNCTIONS =====

export async function getUser(userId: string): Promise<FirebaseUser | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseUser;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function getAllUsers(): Promise<FirebaseUser[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('joined_date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseUser[];
  } catch (error: any) {
    throw new Error(`Failed to fetch users from Firebase: ${error.message}`);
  }
}

export async function updateUser(userId: string, updates: Partial<FirebaseUser>) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: userId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== PRODUCT FUNCTIONS =====

export async function getProducts(filters?: { category?: string; isActive?: boolean }): Promise<FirebaseProduct[]> {
  try {
    let constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters?.isActive !== undefined) {
      constraints.push(where('is_active', '==', filters.isActive));
    }

    constraints.push(orderBy('created_at', 'desc'));
    const q = query(collection(db, 'products'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseProduct[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getProductById(id: string): Promise<FirebaseProduct> {
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseProduct;
    }
    throw new Error('Product not found');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllProducts(): Promise<FirebaseProduct[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseProduct[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createProduct(productData: Omit<FirebaseProduct, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...productData };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateProduct(productId: string, updates: Partial<FirebaseProduct>) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: productId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(productId: string) {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== CART FUNCTIONS =====

export async function getCartItems(userId: string): Promise<FirebaseCartItem[]> {
  try {
    const q = query(collection(db, 'cart_items'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseCartItem[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function addToCart(userId: string, productId: string, quantity: number, selectedSize: string) {
  try {
    // Check if item already exists
    const q = query(
      collection(db, 'cart_items'),
      where('user_id', '==', userId),
      where('product_id', '==', productId),
      where('selected_size', '==', selectedSize)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      // Update existing item
      const docId = querySnapshot.docs[0].id;
      const cartRef = doc(db, 'cart_items', docId);
      const currentQty = querySnapshot.docs[0].data().quantity;
      await updateDoc(cartRef, {
        quantity: currentQty + quantity,
        updated_at: new Date().toISOString()
      });
      return { id: docId };
    } else {
      // Create new item
      const docRef = await addDoc(collection(db, 'cart_items'), {
        user_id: userId,
        product_id: productId,
        quantity,
        selected_size: selectedSize,
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { id: docRef.id };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const cartRef = doc(db, 'cart_items', cartItemId);
    await updateDoc(cartRef, {
      quantity,
      updated_at: new Date().toISOString()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await deleteDoc(doc(db, 'cart_items', cartItemId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function clearCart(userId: string) {
  try {
    const q = query(collection(db, 'cart_items'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== ORDER FUNCTIONS =====

export async function getUserOrders(userId: string): Promise<FirebaseOrder[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseOrder[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllOrders(): Promise<FirebaseOrder[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseOrder[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getOrderById(orderId: string): Promise<FirebaseOrder | null> {
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseOrder;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createOrder(orderData: Omit<FirebaseOrder, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...orderData };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrder(orderId: string, updates: Partial<FirebaseOrder>) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: orderId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const batch = writeBatch(db);

    // Delete order
    batch.delete(doc(db, 'orders', orderId));

    // Delete associated order items
    const itemsQ = query(
      collectionGroup(db, 'order_items'),
      where('order_id', '==', orderId)
    );
    const itemsSnapshot = await getDocs(itemsQ);
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function addOrderItem(orderId: string, itemData: Omit<FirebaseOrderItem, 'id' | 'created_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'orders', orderId, 'order_items'), {
      ...itemData,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...itemData };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getOrderItems(orderId: string): Promise<FirebaseOrderItem[]> {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'orders', orderId, 'order_items')
    );

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseOrderItem[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== PACKAGING OPTIONS FUNCTIONS =====

export async function getPackagingOptions(onlyActive: boolean = true): Promise<FirebasePackagingOption[]> {
  try {
    let constraints: QueryConstraint[] = [];
    if (onlyActive) {
      constraints.push(where('is_active', '==', true));
    }
    constraints.push(orderBy('display_order', 'asc'));

    const q = query(collection(db, 'packaging_options'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebasePackagingOption[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createPackagingOption(data: Omit<FirebasePackagingOption, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'packaging_options'), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updatePackagingOption(optionId: string, updates: Partial<FirebasePackagingOption>) {
  try {
    const optionRef = doc(db, 'packaging_options', optionId);
    await updateDoc(optionRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: optionId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deletePackagingOption(optionId: string) {
  try {
    await deleteDoc(doc(db, 'packaging_options', optionId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== ORDER RETURNS FUNCTIONS =====

export async function getOrderReturns(filters?: { status?: string; userId?: string; orderId?: string }): Promise<FirebaseOrderReturn[]> {
  try {
    let constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.userId) {
      constraints.push(where('user_id', '==', filters.userId));
    }
    if (filters?.orderId) {
      constraints.push(where('order_id', '==', filters.orderId));
    }

    constraints.push(orderBy('requested_date', 'desc'));

    const q = query(collection(db, 'order_returns'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseOrderReturn[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createOrderReturn(data: Omit<FirebaseOrderReturn, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'order_returns'), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderReturn(returnId: string, updates: Partial<FirebaseOrderReturn>) {
  try {
    const returnRef = doc(db, 'order_returns', returnId);
    await updateDoc(returnRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: returnId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteOrderReturn(returnId: string) {
  try {
    await deleteDoc(doc(db, 'order_returns', returnId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== NAVIGATION MENU FUNCTIONS =====

export async function getNavigationMenu(onlyActive: boolean = true): Promise<FirebaseNavigationMenuItem[]> {
  try {
    let constraints: QueryConstraint[] = [];
    if (onlyActive) {
      constraints.push(where('is_active', '==', true));
    }
    constraints.push(orderBy('menu_order', 'asc'));

    const q = query(collection(db, 'navigation_menu_items'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseNavigationMenuItem[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createNavigationMenuItem(data: Omit<FirebaseNavigationMenuItem, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'navigation_menu_items'), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateNavigationMenuItem(menuItemId: string, updates: Partial<FirebaseNavigationMenuItem>) {
  try {
    const itemRef = doc(db, 'navigation_menu_items', menuItemId);
    await updateDoc(itemRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: menuItemId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteNavigationMenuItem(menuItemId: string) {
  try {
    await deleteDoc(doc(db, 'navigation_menu_items', menuItemId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== USER ANALYTICS FUNCTIONS =====

export async function getUserAnalytics(userId: string): Promise<FirebaseUserAnalytics | null> {
  try {
    const q = query(collection(db, 'user_analytics'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirebaseUserAnalytics;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createUserAnalytics(data: Omit<FirebaseUserAnalytics, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const docRef = await addDoc(collection(db, 'user_analytics'), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserAnalytics(analyticsId: string, updates: Partial<FirebaseUserAnalytics>) {
  try {
    const analyticsRef = doc(db, 'user_analytics', analyticsId);
    await updateDoc(analyticsRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return { id: analyticsId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getFrequentCustomers(limitCount: number = 10): Promise<FirebaseUserAnalytics[]> {
  try {
    const q = query(
      collection(db, 'user_analytics'),
      orderBy('frequency_score', 'desc'),
      orderBy('total_spent', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseUserAnalytics[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAnalyticsStats() {
  try {
    const [allAnalytics, allReturns, allOrders] = await Promise.all([
      getDocs(collection(db, 'user_analytics')),
      getDocs(collection(db, 'order_returns')),
      getDocs(collection(db, 'orders'))
    ]);

    const totalRevenue = allAnalytics.docs.reduce((sum, doc) => sum + (doc.data().total_spent || 0), 0);
    const totalCustomers = allAnalytics.size;
    const totalReturnRequests = allReturns.size;
    const returnRate = totalCustomers > 0 ? (totalReturnRequests / totalCustomers) * 100 : 0;
    const averageOrderValue = allAnalytics.docs.length > 0 
      ? totalRevenue / allAnalytics.docs.reduce((sum, doc) => sum + (doc.data().total_orders || 0), 0)
      : 0;

    return {
      totalRevenue,
      totalCustomers,
      totalReturnRequests,
      returnRate: parseFloat(returnRate.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      totalOrders: allOrders.size
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== FIT PROFILE FUNCTIONS =====

export async function getFitProfile(userId: string) {
  try {
    const q = query(collection(db, 'fit_profiles'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function saveFitProfile(userId: string, profileData: any) {
  try {
    const existingProfile = await getFitProfile(userId);

    if (existingProfile) {
      // Update existing
      const profileRef = doc(db, 'fit_profiles', existingProfile.id);
      await updateDoc(profileRef, {
        ...profileData,
        updated_at: new Date().toISOString()
      });
      return { id: existingProfile.id, ...profileData };
    } else {
      // Create new
      const docRef = await addDoc(collection(db, 'fit_profiles'), {
        user_id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { id: docRef.id, ...profileData };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== REVIEW FUNCTIONS =====

export async function getProductReviews(productId: string) {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('product_id', '==', productId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createReview(reviewData: any) {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { id: docRef.id, ...reviewData };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== FAVORITES/WISHLIST FUNCTIONS =====

export async function getUserFavorites(userId: string) {
  try {
    const q = query(collection(db, 'user_favorites'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function addToFavorites(userId: string, productId: string) {
  try {
    const docRef = await addDoc(collection(db, 'user_favorites'), {
      user_id: userId,
      product_id: productId,
      added_at: new Date().toISOString()
    });
    return { id: docRef.id };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function removeFromFavorites(favoriteId: string) {
  try {
    await deleteDoc(doc(db, 'user_favorites', favoriteId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}
