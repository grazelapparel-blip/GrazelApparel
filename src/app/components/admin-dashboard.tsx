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
  Tag,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Menu
} from 'lucide-react';
import { useAppStore, User, Order, FitProfile, Product, NavigationMenuItem, PackagingOption, ReturnRecord, UserAnalytics } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  onBack: () => void;
}

type TabType = 'overview' | 'users' | 'orders' | 'categories' | 'products' | 'fit-profiles' | 'stock' | 'returns' | 'packaging' | 'navigation' | 'analytics';

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
    users, orders, products, fitProfiles, cartItems, returns, packagingOptions, navigationMenu,
    updateOrderStatus, 
    addProduct, updateProduct, deleteProduct, deleteAllProducts,
    addUser, updateUser, deleteUser,
    deleteOrder, deleteFitProfile, getFitProfiles,
    updateStock, addPackagingOption, updatePackagingOption, deletePackagingOption,
    requestReturn, updateReturnStatus, deleteReturn, getOrderReturns,
    updateNavigationMenu, addNavMenuItem, updateNavMenuItem, deleteNavMenuItem,
    getUserAnalytics, getFrequentUsers, getUserActivity, getReturnStats
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
    name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', season: '', festival: '', stock: '0'
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
    if (productForm.category === cat) {
      setProductForm({ ...productForm, category: "" });
    }
  };

  useEffect(() => {
    getFitProfiles();
  }, []);

  useEffect(() => {
    if (activeTab === 'fit-profiles') {
      getFitProfiles();
    }
  }, [activeTab, getFitProfiles]);

  // Statistics calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const orderedOrders = orders.filter(o => o.status === 'ordered').length;
  const totalUsers = users.length;
  const totalProducts = products.length;
  const returnStats = getReturnStats();
  const frequentUsers = getFrequentUsers(3);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return <ShoppingCart size={14} />;
      case 'acknowledged': return <CheckCircle size={14} />;
      case 'shipping': return <Truck size={14} />;
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
    setProductForm({ name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', season: '', festival: '', stock: '0' });
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
      festival: product.festival || '',
      stock: String(product.stock || 0)
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
      stock: Number(productForm.stock) || 0,
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
    { id: 'stock' as TabType, label: 'Stock', icon: Package },
    { id: 'packaging' as TabType, label: 'Packaging', icon: Package },
    { id: 'returns' as TabType, label: 'Returns', icon: RotateCcw },
    { id: 'navigation' as TabType, label: 'Navigation', icon: Menu },
    { id: 'analytics' as TabType, label: 'Analytics', icon: TrendingUp },
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
        <nav className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--crimson)] text-[var(--crimson)]'
                  : 'border-transparent text-gray-500 hover:text-[var(--charcoal)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-500 uppercase tracking-wide">Revenue</span>
                  <BarChart3 size={18} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)]">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-500 uppercase tracking-wide">Orders</span>
                  <ShoppingCart size={18} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)]">{orders.length}</p>
                <p className="text-[11px] text-blue-600 mt-1">{orderedOrders} pending</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-500 uppercase tracking-wide">Users</span>
                  <Users size={18} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)]">{totalUsers}</p>
                <p className="text-[11px] text-green-600 mt-1">{frequentUsers.length} frequent</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-500 uppercase tracking-wide">Products</span>
                  <Package size={18} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)]">{totalProducts}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-gray-500 uppercase tracking-wide">Returns</span>
                  <RotateCcw size={18} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)]">{returnStats.totalReturns}</p>
                <p className="text-[11px] text-orange-600 mt-1">{returnStats.approvedReturns} approved</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600">{getUserById(order.userId)?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">All Users ({filteredUsers.length})</h2>
              <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90">
                <Plus size={16} /> Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
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
                            <div className="w-8 h-8 rounded-full bg-[var(--crimson)] flex items-center justify-center text-white text-[11px] font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">{userOrders.length}</td>
                        <td className="px-6 py-4">₹{totalSpent.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{user.joinedDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditUser(user)} className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 size={16} />
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
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-gray-600">{getUserById(order.userId)?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">{order.items.length}</td>
                      <td className="px-6 py-4">₹{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-2 py-1 text-[11px] font-medium rounded border-0 cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          <option value="ordered">Ordered</option>
                          <option value="acknowledged">Acknowledged</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-blue-600">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600">
                            <Trash2 size={16} />
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
                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-gray-500 mb-1">Customer</p>
                      <p className="font-medium">{getUserById(selectedOrder.userId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Date</p>
                      <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded text-[12px]">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-500">Size: {item.selectedSize} × {item.quantity}</p>
                          </div>
                          <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.packaging && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-[12px] text-blue-800"><strong>Packaging:</strong> {selectedOrder.packaging.label} (+₹{selectedOrder.packaging.price})</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <p className="font-medium">Total</p>
                    <p className="text-[15px] font-medium text-[var(--crimson)]">₹{selectedOrder.total.toLocaleString()}</p>
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
              <p className="text-gray-500 text-[12px] mt-1">Add or remove product categories</p>
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
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded text-[13px]">
                    <span>{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">All Products ({filteredProducts.length})</h2>
              <div className="flex gap-2">
                <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90">
                  <Plus size={16} /> Add Product
                </button>
                <button onClick={handleDeleteAllProducts} className="px-4 py-2 bg-red-600 text-white text-[13px] hover:opacity-90">
                  Delete All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Price (₹)</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4">₹{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[11px] ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-green-600">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product Modal */}
            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
              <div className="space-y-4 text-[13px]">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]"
                  />
                  <input
                    type="number"
                    placeholder="Stock Qty"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  className="w-full h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Fabric" value={productForm.fabric} onChange={(e) => setProductForm({...productForm, fabric: e.target.value})} className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]" />
                  <input type="text" placeholder="Fit" value={productForm.fit} onChange={(e) => setProductForm({...productForm, fit: e.target.value})} className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select value={productForm.gender} onChange={(e) => setProductForm({...productForm, gender: e.target.value})} className="h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]">
                    <option value="">Gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <button onClick={handleSaveProduct} className="w-full h-9 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90 flex items-center justify-center gap-2">
                  <Save size={16} /> Save Product
                </button>
              </div>
            </Modal>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Stock Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">{product.stock} units</td>
                      <td className="px-6 py-4">
                        {product.stock > 20 && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-[11px]">Good Stock</span>}
                        {product.stock <= 20 && product.stock > 0 && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[11px]">Low Stock</span>}
                        {product.stock === 0 && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-[11px]">Out of Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Packaging Tab */}
        {activeTab === 'packaging' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Packaging Options</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {packagingOptions.map((option) => (
                <div key={option.id} className="border border-gray-200 p-4 rounded">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-[14px]">{option.label}</p>
                      <p className="text-[12px] text-gray-500">{option.description}</p>
                    </div>
                    <p className="text-[16px] font-medium text-[var(--crimson)]">₹{option.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 border border-gray-200 text-[12px] hover:bg-gray-50">Edit</button>
                    <button className="flex-1 px-3 py-2 border border-red-200 text-red-600 text-[12px] hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Return Requests ({returns.length})</h2>
            </div>
            {returns.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package size={40} className="mx-auto mb-3 opacity-50" />
                <p>No return requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Return ID</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {returns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{ret.id}</td>
                        <td className="px-6 py-4">{ret.orderId}</td>
                        <td className="px-6 py-4">{ret.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[11px] font-medium ${
                            ret.status === 'approved' ? 'bg-green-100 text-green-800' :
                            ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            ret.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ret.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{ret.requestedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu Tab */}
        {activeTab === 'navigation' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Website Navigation Menu</h2>
              <p className="text-gray-500 text-[12px] mt-1">Manage menu items and sections</p>
            </div>
            <div className="p-6 space-y-3">
              {navigationMenu.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={item.isActive} onChange={() => updateNavMenuItem(item.id, { isActive: !item.isActive })} />
                    <div>
                      <p className="font-medium text-[13px]">{item.label}</p>
                      <p className="text-[11px] text-gray-500">{item.path}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => deleteNavMenuItem(item.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <p className="text-gray-500 text-[12px] uppercase mb-2">Total Revenue</p>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--crimson)]">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <p className="text-gray-500 text-[12px] uppercase mb-2">Avg Order Value</p>
                <p className="font-[var(--font-serif)] text-3xl">₹{orders.length > 0 ? (totalRevenue / orders.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <p className="text-gray-500 text-[12px] uppercase mb-2">Return Rate</p>
                <p className="font-[var(--font-serif)] text-3xl">{returnStats.returnRate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Frequent Customers</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Total Spent (₹)</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Avg Order (₹)</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Return Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getUserActivity().slice(0, 10).map((analytics) => (
                      <tr key={analytics.userId}>
                        <td className="px-6 py-4 font-medium">{getUserById(analytics.userId)?.name}</td>
                        <td className="px-6 py-4">{analytics.totalOrders}</td>
                        <td className="px-6 py-4">₹{analytics.totalSpent.toLocaleString()}</td>
                        <td className="px-6 py-4">₹{analytics.averageOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="px-6 py-4">{analytics.returnRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Edit User' : 'Add User'}>
          <div className="space-y-4 text-[13px]">
            <input type="text" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]" />
            <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]" />
            <input type="tel" placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})} className="w-full h-9 px-3 border border-gray-200 rounded focus:outline-none focus:border-[var(--crimson)]" />
            <button onClick={handleSaveUser} className="w-full h-9 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90 flex items-center justify-center gap-2">
              <Save size={16} /> Save User
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
