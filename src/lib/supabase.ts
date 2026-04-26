import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Using mock data instead.\n' +
    'To use Supabase, create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Custom fetch with timeout to handle network issues gracefully
async function fetchWithTimeout(
  url: string | Request,
  options?: RequestInit,
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    // Log detailed error for debugging
    if (error.name === 'AbortError') {
      console.error('[Supabase] Request timeout:', url);
    } else if (error.message?.includes('ERR_NAME_NOT_RESOLVED') || error.message?.includes('ERR_NETWORK_CHANGED')) {
      console.error('[Supabase] Network error - Supabase may be down or unreachable:', error.message);
    } else {
      console.error('[Supabase] Fetch error:', error);
    }
    throw error;
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    // Use custom fetch with timeout to handle network issues
    global: {
      fetch: fetchWithTimeout
    }
  }
);

// Type definitions for Supabase tables
export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  joined_date: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  fabric: string;
  fit: string;
  category?: string;
  sizes: string[];
  sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  shipping_street?: string;
  shipping_city?: string;
  shipping_postcode?: string;
  shipping_country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface SupabaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  selected_size?: string;
  created_at: string;
}

export interface SupabaseCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  added_at: string;
  updated_at: string;
}

export interface SupabaseFitProfile {
  id: string;
  user_id: string;
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  preferred_fit: 'slim' | 'regular' | 'relaxed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export async function signUpUser(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      },
      // Email confirmation is handled by Supabase automatically
      // The user will receive an OTP via email
    }
  });

  if (error) throw error;
  return data;
}

// Send OTP for login (passwordless)
export async function sendLoginOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false // Don't create user if doesn't exist
    }
  });

  if (error) throw error;
  return data;
}

// Send OTP for signup verification
export async function sendSignupOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true // Create user if doesn't exist
    }
  });

  if (error) throw error;
  return data;
}

// Resend signup confirmation email
export async function resendSignupOTP(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email
  });

  if (error) throw error;
  return data;
}

// Verify OTP code
export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw error;
  return data;
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Product functions
export async function getProducts(filters?: { category?: string; is_active?: boolean }) {
  let query = supabase.from('products').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Cart functions
export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function addToCart(userId: string, productId: string, quantity: number, selectedSize: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity,
      selected_size: selectedSize
    })
    .select();

  if (error) throw error;
  return data;
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select();

  if (error) throw error;
  return data;
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// Order functions
export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOrder(orderData: Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at'>, orderItems: any[]) {
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const itemsToInsert = orderItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
    selected_size: item.selectedSize
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return order;
}

export async function updateOrderStatus(orderId: string, status: SupabaseOrder['status']) {
  const updates: any = { status };

  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
  } else if (status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fit Profile functions
export async function getFitProfile(userId: string) {
  const { data, error } = await supabase
    .from('fit_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

export async function saveFitProfile(userId: string, profileData: Omit<SupabaseFitProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('fit_profiles')
    .upsert({
      user_id: userId,
      ...profileData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// User Profile functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<SupabaseUser>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin functions
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('joined_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), users(name, email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(productData: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, updates: Partial<SupabaseProduct>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}
