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
