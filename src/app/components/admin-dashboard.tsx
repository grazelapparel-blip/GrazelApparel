import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  Ruler, 
  BarChart3, 
  Search,
  ArrowLeft,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Plus,
  X,
  Save,
  Tag
} from 'lucide-react';
import { useAppStore, User, Order, FitProfile, Product } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  onBack: () => void;
}

type TabType = 'overview' | 'users' | 'orders' | 'categories' | 'products' | 'fit-profiles';

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { 
    users, orders, products, fitProfiles, cartItems, 
    updateOrderStatus, 
    addProduct, updateProduct, deleteProduct, deleteAllProducts,
    addUser, updateUser, deleteUser,
    deleteOrder, deleteFitProfile, getFitProfiles
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Category management state
  const [categories, setCategories] = useState<string[]>(["Shirts", "Trousers", "Knitwear", "Outerwear", "Dresses"]);
  const [newCategory, setNewCategory] = useState("");

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', season: '', festival: ''
  });
  const [userForm, setUserForm] = useState({
    name: '', email: '', phone: '', street: '', city: '', postcode: '', country: 'United Kingdom'
  });

  // Category management handlers
  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (cat && !categories.includes(cat)) {
      setCategories([...categories, cat]);
      setNewCategory("");
    }
  };
  const handleDeleteCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
    // If the deleted category is selected in the form, clear it
    if (productForm.category === cat) {
      setProductForm({ ...productForm, category: "" });
    }
  };

  // Fetch fit profiles on component mount and when tab is active
  useEffect(() => {
    getFitProfiles(); // Fetch on mount
  }, []);

  useEffect(() => {
    if (activeTab === 'fit-profiles') {
      getFitProfiles(); // Refresh when tab is clicked
    }
  }, [activeTab, getFitProfiles]);

  // Fetch users when admin dashboard mounts or when users tab is clicked
  useEffect(() => {
    // Trigger a fetch of users from Supabase
    // The app-store already does this, we just need to ensure it's called
  }, []);

  // Statistics calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Package size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);
  const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId);
  const getUserFitProfile = (userId: string) => fitProfiles.find(p => p.userId === userId);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserById(order.userId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Product CRUD handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', season: '', festival: '' });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      image: product.image,
      fabric: product.fabric,
      fit: product.fit,
      category: product.category || '',
      size: product.size?.join(', ') || '',
      gender: product.gender || '',
      isEssential: product.isEssential || false,
      isHighlight: product.isHighlight || false,
      isTop: product.isTop || false,
      isBottom: product.isBottom || false,
      offerPercentage: String(product.offerPercentage || ''),
      season: product.season || '',
      festival: product.festival || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    const productData = {
      name: productForm.name,
      price: Number(productForm.price),
      image: productForm.image || 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
      fabric: productForm.fabric,
      fit: productForm.fit,
      category: productForm.category,
      size: productForm.size.split(',').map(s => s.trim()).filter(Boolean),
      gender: productForm.gender,
      isEssential: productForm.isEssential,
      isHighlight: productForm.isHighlight,
      isTop: productForm.isTop,
      isBottom: productForm.isBottom,
      offerPercentage: Number(productForm.offerPercentage) || 0,
      season: productForm.season,
      festival: productForm.festival,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleDeleteAllProducts = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete ALL products? This action cannot be undone.\n\nAll existing products will be deleted from the store. You can then add new products.'
    );
    if (confirmed) {
      await deleteAllProducts();
    }
  };

  // User CRUD handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', phone: '', street: '', city: '', postcode: '', country: 'United Kingdom' });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      postcode: user.address?.postcode || '',
      country: user.address?.country || 'United Kingdom'
    });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    const userData = {
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone || undefined,
      address: userForm.street ? {
        street: userForm.street,
        city: userForm.city,
        postcode: userForm.postcode,
        country: userForm.country
      } : undefined
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      setSelectedUser(null);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
      setSelectedOrder(null);
    }
  };

  const handleDeleteFitProfile = (userId: string) => {
    if (confirm('Are you sure you want to delete this fit profile?')) {
      deleteFitProfile(userId);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
    { id: 'categories' as TabType, label: 'Categories', icon: Tag },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'fit-profiles' as TabType, label: 'Fit Profiles', icon: Ruler }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
                <span className="text-[14px]">Back to Store</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-10 pr-4 w-64 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <nav className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--crimson)] text-[var(--crimson)]'
                  : 'border-transparent text-gray-500 hover:text-[var(--charcoal)]'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Dashboard Overview</h2>
              <button
                onClick={() => {
                  // Refresh all data from Supabase
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 text-[13px] hover:bg-gray-300 rounded"
              >
                Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase tracking-wide">Total Revenue</span>
                  <BarChart3 size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase tracking-wide">Total Orders</span>
                  <ShoppingCart size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{orders.length}</p>
                <p className="text-[12px] text-yellow-600 mt-2">{pendingOrders} pending</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase tracking-wide">Total Users</span>
                  <Users size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{totalUsers}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase tracking-wide">Products</span>
                  <Package size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{totalProducts}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] font-medium">{order.id}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{getUserById(order.userId)?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-[14px]">£{order.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Current Cart ({cartItems.length} items)</h2>
                </div>
                <div className="p-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                      <div className="flex-1">
                        <p className="text-[14px] font-medium">{item.name}</p>
                        <p className="text-[13px] text-gray-500">Size: {item.selectedSize} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[14px] font-medium text-[var(--crimson)]">£{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">All Users ({filteredUsers.length})</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Refetch users from Supabase
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 text-[13px] hover:bg-gray-300 rounded"
                >
                  Refresh
                </button>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90">
                  <Plus size={16} /> Add User
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const userOrders = getUserOrders(user.id);
                    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--crimson)] flex items-center justify-center text-white text-[14px] font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-[14px] font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-[14px]">{userOrders.length}</td>
                        <td className="px-6 py-4 text-[14px]">£{totalSpent.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditUser(user)} className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">All Orders ({filteredOrders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-[14px] font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{getUserById(order.userId)?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-[14px]">{order.items.length} items</td>
                      <td className="px-6 py-4 text-[14px]">£{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-2 py-1 text-[12px] font-medium rounded border-0 cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-blue-600" title="View Details">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Order Details Modal */}
            {selectedOrder && (
              <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder.id}`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-[14px] text-gray-500">Customer</p>
                      <p className="text-[16px] font-medium">{getUserById(selectedOrder.userId)?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] text-gray-500">Date</p>
                      <p className="text-[14px]">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[14px] font-medium mb-3">Order Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-[14px] font-medium">{item.name}</p>
                            <p className="text-[12px] text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <p className="text-[14px]">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-[16px] font-medium">Total</p>
                    <p className="text-[18px] font-medium text-[var(--crimson)]">£{selectedOrder.total.toFixed(2)}</p>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-[14px] font-medium mb-2">Update Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value as Order['status']);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value as Order['status'] });
                      }}
                      className={`w-full px-3 py-2 text-[14px] font-medium rounded border border-gray-200 ${getStatusColor(selectedOrder.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setSelectedOrder(null)} className="flex-1 h-10 border border-gray-200 text-[14px] text-gray-600 hover:bg-gray-50">
                      Close
                    </button>
                    <button
                      onClick={() => { handleDeleteOrder(selectedOrder.id); setSelectedOrder(null); }}
                      className="flex-1 h-10 bg-red-600 text-white text-[14px] hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete Order
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Manage Categories</h2>
              <p className="text-gray-500 text-sm mt-1">Add or remove product categories</p>
            </div>
            <div className="p-6">
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 h-10 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90 disabled:opacity-50"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-3 rounded">
                    <span className="text-[14px] text-[var(--charcoal)]">{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)} 
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {categories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No categories yet</p>
                  <p className="text-sm">Add your first category above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-0">
                <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">All Products ({filteredProducts.length})</h2>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAllProducts} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[13px] hover:bg-red-700 whitespace-nowrap flex-shrink-0">
                    <Trash2 size={16} /> Delete All
                  </button>
                  <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90 whitespace-nowrap flex-shrink-0">
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Fabric</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Fit</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Offer %</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Essential</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        <p className="text-[14px] font-medium mb-2">No products available</p>
                        <p className="text-[13px]">Click "Add Product" to create your first product</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <ImageWithFallback src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            <span className="text-[14px] font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{product.category || '-'}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{product.gender || '-'}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{product.fabric}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{product.fit}</td>
                        <td className="px-6 py-4 text-[14px] text-[var(--crimson)] font-medium">₹{product.price}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{product.offerPercentage ? `${product.offerPercentage}%` : '-'}</td>
                        <td className="px-6 py-4 text-[14px]">{product.isEssential ? '✓' : '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fit Profiles Tab */}
        {activeTab === 'fit-profiles' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Fit Profiles ({fitProfiles.length})</h2>
              <p className="text-[13px] text-gray-500 mt-1">User size preferences and body type information</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Body Type</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Height</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Preferred Fit</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fitProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No fit profiles yet. Users can create their profiles to help find the perfect fit.
                      </td>
                    </tr>
                  ) : (
                    fitProfiles.map((profile: any) => {
                      const user = getUserById(profile.userId);
                      // Use bodyType directly from profile
                      const bodyType = profile.bodyType || '-';

                      // Show user if found, otherwise show userId
                      const displayName = user?.name || 'User';
                      const displayEmail = user?.email || profile.userId;
                      const userInitials = user?.name
                        ? user.name.split(' ').map((n: string) => n[0]).join('')
                        : profile.userId.substring(0, 2).toUpperCase();

                      return (
                        <tr key={profile.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--crimson)] flex items-center justify-center text-white text-[14px] font-medium">
                                {userInitials}
                              </div>
                              <div>
                                <p className="text-[14px] font-medium">{displayName}</p>
                                <p className="text-[12px] text-gray-500">{displayEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-[14px] font-bold rounded bg-[var(--crimson)] text-white">{profile.preferredSize || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-[12px] font-medium rounded bg-blue-100 text-blue-800 capitalize">{bodyType}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{profile.height ? `${profile.height} cm` : '-'}</td>
                          <td className="px-6 py-4 text-gray-600">{profile.weight ? `${profile.weight} kg` : '-'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-[12px] font-medium rounded bg-gray-100 capitalize">{profile.preferredFit || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-[12px]">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDeleteFitProfile(profile.userId)} 
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                              title="Delete profile"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Product Name *</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="e.g., Cashmere Sweater"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">Price (₹) *</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                placeholder="295"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Image URL</label>
            <input
              type="text"
              value={productForm.image}
              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">Fabric *</label>
              <select
                value={productForm.fabric}
                onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              >
                <option value="">Select fabric</option>
                <option value="Cotton">Cotton</option>
                <option value="Wool">Wool</option>
                <option value="Silk">Silk</option>
                <option value="Linen">Linen</option>
                <option value="Cashmere">Cashmere</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">Fit *</label>
              <select
                value={productForm.fit}
                onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              >
                <option value="">Select fit</option>
                <option value="Slim Fit">Slim Fit</option>
                <option value="Regular Fit">Regular Fit</option>
                <option value="Relaxed Fit">Relaxed Fit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Sizes (comma separated)</label>
            <input
              type="text"
              value={productForm.size}
              onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="S, M, L, XL"
            />
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Gender</label>
            <select
              value={productForm.gender}
              onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="">Select gender</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isEssential"
              checked={productForm.isEssential}
              onChange={(e) => setProductForm({ ...productForm, isEssential: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isEssential" className="text-[14px] text-[var(--charcoal)] cursor-pointer">
              Mark as Essential
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHighlight"
              checked={productForm.isHighlight}
              onChange={(e) => setProductForm({ ...productForm, isHighlight: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isHighlight" className="text-[14px] text-[var(--charcoal)] cursor-pointer">
              Show in Highlight (Men & Women Collections)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isTop"
              checked={productForm.isTop}
              onChange={(e) => setProductForm({ ...productForm, isTop: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isTop" className="text-[14px] text-[var(--charcoal)] cursor-pointer">
              Top (Enable Curate Your Fit - Chest, Shoulder, etc.)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isBottom"
              checked={productForm.isBottom}
              onChange={(e) => setProductForm({ ...productForm, isBottom: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isBottom" className="text-[14px] text-[var(--charcoal)] cursor-pointer">
              Bottom (Enable Curate Your Fit - Waist, Thigh, Inseam, etc.)
            </label>
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Season</label>
            <select
              value={productForm.season}
              onChange={(e) => setProductForm({ ...productForm, season: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="">Select season</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Autumn">Autumn</option>
            </select>
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Festival</label>
            <select
              value={productForm.festival}
              onChange={(e) => setProductForm({ ...productForm, festival: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="">Select festival</option>
              <option value="Diwali">Diwali</option>
              <option value="Holi">Holi</option>
              <option value="Eid">Eid</option>
              <option value="Christmas">Christmas</option>
              <option value="New Year">New Year</option>
              <option value="Pongal">Pongal</option>
              <option value="Onam">Onam</option>
              <option value="Durga Puja">Durga Puja</option>
              <option value="Wedding">Wedding</option>
              <option value="Party">Party</option>
            </select>
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Offer Percentage (%)</label>
            <input
              type="number"
              value={productForm.offerPercentage}
              onChange={(e) => setProductForm({ ...productForm, offerPercentage: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowProductModal(false)} className="flex-1 h-10 border border-gray-200 text-[14px] text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={!productForm.name || !productForm.price || !productForm.fabric || !productForm.fit}
              className="flex-1 h-10 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} /> {editingProduct ? 'Update' : 'Add'} Product
            </button>
          </div>
        </div>
      </Modal>

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Full Name *</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Email *</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-[14px] text-[var(--charcoal)] mb-2">Phone</label>
            <input
              type="tel"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="+44 7700 900000"
            />
          </div>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-[14px] font-medium text-[var(--charcoal)] mb-4">Address (Optional)</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={userForm.street}
                onChange={(e) => setUserForm({ ...userForm, street: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={userForm.city}
                  onChange={(e) => setUserForm({ ...userForm, city: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={userForm.postcode}
                  onChange={(e) => setUserForm({ ...userForm, postcode: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                  placeholder="Postcode"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowUserModal(false)} className="flex-1 h-10 border border-gray-200 text-[14px] text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              disabled={!userForm.name || !userForm.email}
              className="flex-1 h-10 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} /> {editingUser ? 'Update' : 'Add'} User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
