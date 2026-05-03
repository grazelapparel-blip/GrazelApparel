import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
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
  upsert,
  writeBatch,
  orderBy,
  QueryConstraint
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

// Type definitions
export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  fabric: string;
  fit: string;
  category?: string;
  sizes: string[];
  sku?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseOrder {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  shippingStreet?: string;
  shippingCity?: string;
  shippingPostcode?: string;
  shippingCountry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface FirebaseOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  createdAt: string;
}

export interface FirebaseCartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedSize: string;
  addedAt: string;
  updatedAt: string;
}

export interface FirebaseFitProfile {
  id: string;
  userId: string;
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  preferredFit: 'slim' | 'regular' | 'relaxed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
      joinedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { user };
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

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    // Set custom parameters for Google sign-in
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Create/update user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      name: user.displayName || 'User',
      photoUrl: user.photoURL,
      joinedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true }); // merge: true to not overwrite existing data

    return { user };
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked. Please enable pop-ups for this site.');
    } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('Google sign-in is not available in this environment. Please use email/password instead.');
    }
    throw new Error(error.message || 'Google sign-in failed. Please try again.');
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

// ===== PRODUCT FUNCTIONS =====

export async function getProducts(filters?: { category?: string; isActive?: boolean }) {
  try {
    let constraints: QueryConstraint[] = [];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    const q = query(collection(db, 'products'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseProduct));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getProductById(id: string) {
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

export async function createProduct(productData: Omit<FirebaseProduct, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
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

export async function getAllProducts() {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseProduct));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== CART FUNCTIONS =====

export async function getCartItems(userId: string) {
  try {
    const q = query(collection(db, 'cartItems'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const cartItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseCartItem));

    // Fetch product details for each cart item
    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await getProductById(item.productId);
        return { ...item, product };
      })
    );

    return itemsWithProducts;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function addToCart(userId: string, productId: string, quantity: number, selectedSize: string) {
  try {
    // Check if item already exists
    const q = query(
      collection(db, 'cartItems'),
      where('userId', '==', userId),
      where('productId', '==', productId),
      where('selectedSize', '==', selectedSize)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      // Update existing item
      const docId = querySnapshot.docs[0].id;
      const cartRef = doc(db, 'cartItems', docId);
      await updateDoc(cartRef, {
        quantity: querySnapshot.docs[0].data().quantity + quantity,
        updatedAt: new Date().toISOString()
      });
      return { id: docId };
    } else {
      // Create new item
      const docRef = await addDoc(collection(db, 'cartItems'), {
        userId,
        productId,
        quantity,
        selectedSize,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const cartRef = doc(db, 'cartItems', cartItemId);
    await updateDoc(cartRef, {
      quantity,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await deleteDoc(doc(db, 'cartItems', cartItemId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function clearCart(userId: string) {
  try {
    const q = query(collection(db, 'cartItems'), where('userId', '==', userId));
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

export async function getUserOrders(userId: string) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseOrder));

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsQ = query(
          collection(db, 'orderItems'),
          where('orderId', '==', order.id)
        );
        const itemsSnapshot = await getDocs(itemsQ);
        const items = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FirebaseOrderItem));
        return { ...order, orderItems: items };
      })
    );

    return ordersWithItems;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createOrder(
  orderData: Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>,
  orderItems: any[]
) {
  try {
    // Create order
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create order items
    const itemsToInsert = orderItems.map(item => ({
      orderId: orderRef.id,
      productId: item.productId || item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      selectedSize: item.selectedSize,
      createdAt: new Date().toISOString()
    }));

    const batch = writeBatch(db);
    for (const item of itemsToInsert) {
      const itemRef = doc(collection(db, 'orderItems'));
      batch.set(itemRef, item);
    }
    await batch.commit();

    return { id: orderRef.id, ...orderData };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderStatus(orderId: string, status: FirebaseOrder['status']) {
  try {
    const updates: any = { status, updatedAt: new Date().toISOString() };

    if (status === 'shipped') {
      updates.shippedAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }

    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, updates);
    return { id: orderId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllOrders() {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseOrder));

    // Fetch order items and user data
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsQ = query(
          collection(db, 'orderItems'),
          where('orderId', '==', order.id)
        );
        const itemsSnapshot = await getDocs(itemsQ);
        const items = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FirebaseOrderItem));

        const userDoc = await getDoc(doc(db, 'users', order.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        return {
          ...order,
          orderItems: items,
          user: { name: userData.name, email: userData.email }
        };
      })
    );

    return ordersWithDetails;
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
      collection(db, 'orderItems'),
      where('orderId', '==', orderId)
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

// ===== FIT PROFILE FUNCTIONS =====

export async function getFitProfile(userId: string) {
  try {
    const q = query(collection(db, 'fitProfiles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirebaseFitProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function saveFitProfile(
  userId: string,
  profileData: Omit<FirebaseFitProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
) {
  try {
    const existingProfile = await getFitProfile(userId);

    if (existingProfile) {
      // Update existing
      const profileRef = doc(db, 'fitProfiles', existingProfile.id);
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      return { id: existingProfile.id, ...profileData };
    } else {
      // Create new
      const docRef = await addDoc(collection(db, 'fitProfiles'), {
        userId,
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...profileData };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== USER PROFILE FUNCTIONS =====

export async function getUserProfile(userId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseUser;
    }
    throw new Error('User not found');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserProfile(userId: string, updates: Partial<FirebaseUser>) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: userId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllUsers() {
  try {
    const q = query(collection(db, 'users'), orderBy('joinedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseUser));
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

// ===== PACKAGING OPTIONS FUNCTIONS =====

export interface FirebasePackagingOption {
  id: string;
  name: string;
  label: string;
  description?: string;
  price: number;
  currencyCode?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPackagingOptions(onlyActive: boolean = true) {
  try {
    let constraints: QueryConstraint[] = [];
    if (onlyActive) {
      constraints.push(where('isActive', '==', true));
    }
    constraints.push(orderBy('displayOrder', 'asc'));

    const q = query(collection(db, 'packagingOptions'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebasePackagingOption));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createPackagingOption(data: Omit<FirebasePackagingOption, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'packagingOptions'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updatePackagingOption(optionId: string, updates: Partial<FirebasePackagingOption>) {
  try {
    const optionRef = doc(db, 'packagingOptions', optionId);
    await updateDoc(optionRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: optionId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deletePackagingOption(optionId: string) {
  try {
    await deleteDoc(doc(db, 'packagingOptions', optionId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== ORDER RETURNS FUNCTIONS =====

export interface FirebaseOrderReturn {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requestedDate: string;
  resolvedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrderReturns(filters?: { status?: string; userId?: string; orderId?: string }) {
  try {
    let constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    if (filters?.orderId) {
      constraints.push(where('orderId', '==', filters.orderId));
    }

    constraints.push(orderBy('requestedDate', 'desc'));

    const q = query(collection(db, 'orderReturns'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseOrderReturn));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createOrderReturn(data: Omit<FirebaseOrderReturn, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'orderReturns'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderReturn(returnId: string, updates: Partial<FirebaseOrderReturn>) {
  try {
    const returnRef = doc(db, 'orderReturns', returnId);
    await updateDoc(returnRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: returnId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteOrderReturn(returnId: string) {
  try {
    await deleteDoc(doc(db, 'orderReturns', returnId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== NAVIGATION MENU FUNCTIONS =====

export interface FirebaseNavigationMenuItem {
  id: string;
  label: string;
  path: string;
  isActive: boolean;
  menuOrder: number;
  iconName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getNavigationMenu(onlyActive: boolean = true) {
  try {
    let constraints: QueryConstraint[] = [];
    if (onlyActive) {
      constraints.push(where('isActive', '==', true));
    }
    constraints.push(orderBy('menuOrder', 'asc'));

    const q = query(collection(db, 'navigationMenu'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseNavigationMenuItem));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createNavigationMenuItem(data: Omit<FirebaseNavigationMenuItem, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'navigationMenu'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateNavigationMenuItem(menuItemId: string, updates: Partial<FirebaseNavigationMenuItem>) {
  try {
    const itemRef = doc(db, 'navigationMenu', menuItemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: menuItemId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteNavigationMenuItem(menuItemId: string) {
  try {
    await deleteDoc(doc(db, 'navigationMenu', menuItemId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== USER ANALYTICS FUNCTIONS =====

export interface FirebaseUserAnalytics {
  id: string;
  userId: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  frequencyScore: number;
  returnCount: number;
  averageOrderValue: number;
  returnRate: number;
  createdAt: string;
  updatedAt: string;
}

export async function getUserAnalytics(userId: string) {
  try {
    const q = query(collection(db, 'userAnalytics'), where('userId', '==', userId));
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

export async function createUserAnalytics(data: Omit<FirebaseUserAnalytics, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'userAnalytics'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserAnalytics(analyticsId: string, updates: Partial<FirebaseUserAnalytics>) {
  try {
    const analyticsRef = doc(db, 'userAnalytics', analyticsId);
    await updateDoc(analyticsRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: analyticsId, ...updates };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getFrequentCustomers(limit: number = 10) {
  try {
    const q = query(
      collection(db, 'userAnalytics'),
      orderBy('frequencyScore', 'desc'),
      orderBy('totalSpent', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseUserAnalytics));

    return results;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAnalyticsStats() {
  try {
    const [allAnalytics, allReturns, allOrders] = await Promise.all([
      getDocs(collection(db, 'userAnalytics')),
      getDocs(collection(db, 'orderReturns')),
      getDocs(collection(db, 'orders'))
    ]);

    const totalRevenue = allAnalytics.docs.reduce((sum, doc) => sum + (doc.data().totalSpent || 0), 0);
    const totalCustomers = allAnalytics.size;
    const totalReturnRequests = allReturns.size;
    const returnRate = totalCustomers > 0 ? (totalReturnRequests / totalCustomers) * 100 : 0;
    const averageOrderValue = allAnalytics.docs.length > 0 
      ? totalRevenue / allAnalytics.docs.reduce((sum, doc) => sum + (doc.data().totalOrders || 0), 0)
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
