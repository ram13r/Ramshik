import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Plus, Trash2, Edit, X, Save, CheckCircle, Clock, Truck, AlertCircle, Settings as SettingsIcon, Upload, Image, Globe, MapPin, Star, Instagram, Grid } from 'lucide-react';
import { Product, Category } from '../types';
import ImageCropper from '../components/ImageCropper';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [croppingImage, setCroppingImage] = useState<{
    src: string;
    type: 'product' | 'logo' | 'slide' | 'additional' | 'upi_qr' | 'testimonial_avatar' | 'category_image';
    index?: number;
    aspect?: number;
  } | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const fetchData = async () => {
    const [statsRes, productsRes, ordersRes, usersRes, categoriesRes, settingsRes] = await Promise.all([
      fetch('/api/admin/stats').then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/admin/orders').then(res => res.json()),
      fetch('/api/admin/users').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]);
    setStats(statsRes);
    setProducts(productsRes);
    setOrders(ordersRes);
    setUsers(usersRes);
    setCategories(categoriesRes);
    
    // Parse JSON settings
    const jsonFields = ['hero_slides', 'site_stats', 'site_testimonials', 'arrival_categories', 'product_offers'];
    jsonFields.forEach(field => {
      if (settingsRes[field] && typeof settingsRes[field] === 'string') {
        try {
          settingsRes[field] = JSON.parse(settingsRes[field]);
        } catch (e) {
          settingsRes[field] = [];
        }
      }
    });
    setSettings(settingsRes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...settings,
      hero_slides: JSON.stringify(settings.hero_slides),
      site_stats: JSON.stringify(settings.site_stats),
      site_testimonials: JSON.stringify(settings.site_testimonials),
      arrival_categories: JSON.stringify(settings.arrival_categories),
      product_offers: JSON.stringify(settings.product_offers)
    };
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setNotification({ message: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification({ message: 'Failed to save settings.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const cleanImageUrl = (url: string) => {
    if (!url) return '';
    // Handle Unsplash page URLs
    if (url.includes('unsplash.com/photos/')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      // Unsplash IDs are usually the last part after a hyphen or just the last part
      const id = lastPart.includes('-') ? lastPart.split('-').pop() : lastPart;
      if (id) return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
    }
    // Handle Unsplash direct image URLs
    if (url.includes('images.unsplash.com/photo-') && !url.includes('auto=format')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}auto=format&fit=crop&w=800&q=80`;
    }
    return url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo' | 'slide' | 'additional' | 'video' | 'upi_qr' | 'testimonial_avatar' | 'category_image', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (type === 'video') {
        const newVideos = [...(editingProduct?.videos || []), base64String];
        setEditingProduct({ ...editingProduct, videos: newVideos });
        return;
      }

      let aspect = 1;
      if (type === 'product' || type === 'additional') aspect = 3/4;
      if (type === 'slide') aspect = 16/9;
      if (type === 'logo') aspect = 1;
      if (type === 'category_image') aspect = 4/3;

      setCroppingImage({
        src: base64String,
        type,
        index,
        aspect
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    if (!croppingImage) return;

    const { type, index } = croppingImage;

    if (type === 'product') {
      setEditingProduct({ ...editingProduct, image_url: croppedImage });
    } else if (type === 'logo') {
      setSettings({ ...settings, site_logo: croppedImage });
    } else if (type === 'slide' && typeof index === 'number') {
      const newSlides = [...(settings.hero_slides || [])];
      newSlides[index] = croppedImage;
      setSettings({ ...settings, hero_slides: newSlides });
    } else if (type === 'additional') {
      const newImages = [...(editingProduct?.additional_images || []), croppedImage];
      setEditingProduct({ ...editingProduct, additional_images: newImages });
    } else if (type === 'upi_qr') {
      setSettings({ ...settings, upi_qr_code: croppedImage });
    } else if (type === 'testimonial_avatar' && typeof index === 'number') {
      updateTestimonial(index, 'avatar', croppedImage);
    } else if (type === 'category_image') {
      setEditingCategory({ ...editingCategory, image_url: croppedImage });
    }

    setCroppingImage(null);
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...(settings.site_stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setSettings({ ...settings, site_stats: newStats });
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const newTestimonials = [...(settings.site_testimonials || [])];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setSettings({ ...settings, site_testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    const newTestimonials = [...(settings.site_testimonials || []), { name: '', role: '', content: '', rating: 5, avatar: '' }];
    setSettings({ ...settings, site_testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = settings.site_testimonials.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, site_testimonials: newTestimonials });
  };

  const updateArrivalCategory = (index: number, field: string, value: string) => {
    const newCats = [...(settings.arrival_categories || [])];
    newCats[index] = { ...newCats[index], [field]: value };
    setSettings({ ...settings, arrival_categories: newCats });
  };

  const addArrivalCategory = () => {
    const newCats = [...(settings.arrival_categories || []), { id: '', label: '' }];
    setSettings({ ...settings, arrival_categories: newCats });
  };

  const removeArrivalCategory = (index: number) => {
    const newCats = settings.arrival_categories.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, arrival_categories: newCats });
  };

  const updateProductOffer = (index: number, value: string) => {
    const newOffers = [...(settings.product_offers || [])];
    newOffers[index] = value;
    setSettings({ ...settings, product_offers: newOffers });
  };

  const addProductOffer = () => {
    const newOffers = [...(settings.product_offers || []), ''];
    setSettings({ ...settings, product_offers: newOffers });
  };

  const removeProductOffer = (index: number) => {
    const newOffers = settings.product_offers.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, product_offers: newOffers });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct?.id ? 'PUT' : 'POST';
    const url = editingProduct?.id ? `/api/products/${editingProduct.id}` : '/api/products';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });

    if (res.ok) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
      setNotification({ message: `Product ${editingProduct?.id ? 'updated' : 'created'} successfully`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this product?',
      onConfirm: async () => {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
          setNotification({ message: 'Product deleted successfully', type: 'success' });
          setTimeout(() => setNotification(null), 3000);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory?.id ? 'PUT' : 'POST';
    const url = editingCategory?.id ? `/api/categories/${editingCategory.id}` : '/api/categories';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCategory)
    });

    if (res.ok) {
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      fetchData();
      setNotification({ message: `Category ${editingCategory?.id ? 'updated' : 'created'} successfully`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
          setNotification({ message: 'Category deleted successfully', type: 'success' });
          setTimeout(() => setNotification(null), 3000);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchData();
      setNotification({ message: 'Order status updated', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="text-green-500" size={16} />;
      case 'shipped': return <Truck className="text-blue-500" size={16} />;
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      default: return <AlertCircle className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col flex-shrink-0">
        <h2 className="text-2xl font-serif font-bold text-brand-deep-pink mb-10">Admin Panel</h2>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <Package size={20} />
            <span>Products</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <ShoppingCart size={20} />
            <span>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'customers' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <Users size={20} />
            <span>Customers</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <Grid size={20} />
            <span>Categories</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-brand-pink text-brand-deep-pink font-bold' : 'hover:bg-slate-50'}`}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </button>
        </nav>
        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <h1 className="text-3xl font-serif font-bold">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold">₹{stats?.sales.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats?.orders}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold">{stats?.products}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Total Customers</p>
                <p className="text-3xl font-bold">{stats?.users}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-serif font-bold mb-6">Recent Orders</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-xs text-slate-500">{order.user_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-deep-pink">₹{order.total.toLocaleString('en-IN')}</p>
                        <p className="text-xs uppercase tracking-widest">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-serif font-bold mb-6">Top Products</h3>
                <div className="space-y-4">
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <img src={product.image_url} className="w-10 h-10 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="font-bold line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500">₹{product.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-serif font-bold">Manage Products</h1>
              <button 
                onClick={() => { setEditingProduct({}); setIsProductModalOpen(true); }}
                className="gold-button flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Product</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold">Stock</th>
                    <th className="px-6 py-4 font-bold">Featured</th>
                    <th className="px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center space-x-4">
                        <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.category_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                        {p.discount_price && <p className="text-xs text-slate-400 line-through">₹{p.discount_price.toLocaleString('en-IN')}</p>}
                      </td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4">
                        {p.is_featured ? <span className="text-brand-gold font-bold text-xs uppercase">Yes</span> : <span className="text-slate-300 text-xs uppercase">No</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Order ID</th>
                    <th className="px-6 py-4 font-bold">Customer</th>
                    <th className="px-6 py-4 font-bold">Total</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{o.customer_name || o.user_name}</p>
                        <p className="text-xs text-slate-500">{o.customer_email || o.user_email}</p>
                        {o.customer_phone && <p className="text-xs text-slate-400">{o.customer_phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-deep-pink">₹{o.total.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">{o.payment_method}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(o.status)}
                          <span className="capitalize font-medium">{o.status}</span>
                        </div>
                        {o.razorpay_payment_id && (
                          <p className="text-[10px] text-slate-400 mt-1">ID: {o.razorpay_payment_id}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 ring-brand-gold"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold">Customers</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">ID</th>
                    <th className="px-6 py-4 font-bold">Name</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4 font-bold">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-serif font-bold">Manage Categories</h1>
              <button 
                onClick={() => { setEditingCategory({}); setIsCategoryModalOpen(true); }}
                className="gold-button flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Category</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="aspect-[4/3] relative bg-slate-100">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Image size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true); }}
                        className="p-2 bg-white text-blue-500 rounded-lg shadow hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 bg-white text-red-500 rounded-lg shadow hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-pink border-t border-brand-pink/20">
                    <h3 className="text-center font-bold text-brand-deep-pink tracking-wide">{c.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10 max-w-4xl">
            <h1 className="text-3xl font-serif font-bold">Site Settings</h1>
            
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold">General Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Website Name</label>
                        <input 
                          type="text" 
                          value={settings.site_name || ''}
                          onChange={e => setSettings({...settings, site_name: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Tagline</label>
                        <input 
                          type="text" 
                          value={settings.site_tagline || ''}
                          onChange={e => setSettings({...settings, site_tagline: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Logo</label>
                        <div className="flex items-center space-x-4">
                          {settings.site_logo && (
                            <img 
                              src={settings.site_logo} 
                              alt="Logo Preview" 
                              referrerPolicy="no-referrer"
                              className={`w-auto object-contain border border-slate-100 rounded p-1 ${
                                settings.logo_size === 'small' ? 'h-12' : 
                                settings.logo_size === 'medium' ? 'h-20' :
                                settings.logo_size === 'large' ? 'h-32' : 
                                settings.logo_size === 'xl' ? 'h-48' : 'h-20'
                              }`} 
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex space-x-2 mb-2">
                              {['small', 'medium', 'large', 'xl'].map(size => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setSettings({...settings, logo_size: size})}
                                  className={`flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                                    settings.logo_size === size 
                                      ? 'bg-brand-gold text-white border-brand-gold' 
                                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              placeholder="Logo URL"
                              value={settings.site_logo || ''}
                              onChange={e => setSettings({...settings, site_logo: cleanImageUrl(e.target.value)})}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 ring-brand-gold outline-none mb-2"
                            />
                            <label className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-bold">
                              <Upload size={16} />
                              <span>Upload Logo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold">Hero Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Hero Title</label>
                        <input 
                          type="text" 
                          value={settings.hero_title || ''}
                          onChange={e => setSettings({...settings, hero_title: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Hero Subtitle</label>
                        <textarea 
                          rows={3}
                          value={settings.hero_subtitle || ''}
                          onChange={e => setSettings({...settings, hero_subtitle: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold">Customer Satisfaction Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(settings.site_stats || []).map((stat: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-100 rounded-2xl space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              {idx === 0 && <Users size={16} />}
                              {idx === 1 && <ShoppingCart size={16} />}
                              {idx === 2 && <MapPin size={16} />}
                              {idx === 3 && <Star size={16} />}
                            </div>
                            <span className="text-xs font-bold uppercase text-slate-400">Stat {idx + 1}</span>
                          </div>
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              placeholder="Value (e.g. 10k+)"
                              value={stat.value || ''}
                              onChange={e => updateStat(idx, 'value', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Label (e.g. Happy Customers)"
                              value={stat.label || ''}
                              onChange={e => updateStat(idx, 'label', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold">Hero Slider (4 Images)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map(idx => (
                        <div key={idx} className="space-y-2">
                          <label className="block text-xs font-bold uppercase text-slate-400">Slide {idx + 1}</label>
                          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative group border border-slate-200">
                            {settings.hero_slides?.[idx] ? (
                              <img src={settings.hero_slides[idx]} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Image size={32} />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                              <Upload className="text-white" size={24} />
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'slide', idx)} />
                            </label>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Image URL"
                            value={settings.hero_slides?.[idx] || ''}
                            onChange={e => {
                              const newSlides = [...(settings.hero_slides || [])];
                              newSlides[idx] = cleanImageUrl(e.target.value);
                              setSettings({...settings, hero_slides: newSlides});
                            }}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:ring-1 ring-brand-gold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-serif font-bold">New Arrivals Tabs</h3>
                      <button 
                        type="button"
                        onClick={addArrivalCategory}
                        className="text-xs font-bold text-brand-deep-pink hover:underline flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Add Tab</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 italic">Configure the categories shown in the "New Arrivals" section on the home page. ID must match the category name exactly.</p>
                    <div className="space-y-4">
                      {(settings.arrival_categories || [
                        { id: 'Sarees', label: 'SAREES' },
                        { id: 'Artificial Jewellery', label: 'JEWELLERY' }
                      ]).map((cat: any, idx: number) => (
                        <div key={idx} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl relative group">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category Name (ID)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Sarees"
                                value={cat.id || ''}
                                onChange={e => updateArrivalCategory(idx, 'id', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Label</label>
                              <input 
                                type="text" 
                                placeholder="e.g. SAREES"
                                value={cat.label || ''}
                                onChange={e => updateArrivalCategory(idx, 'label', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                              />
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeArrivalCategory(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-serif font-bold">Product Offers</h3>
                      <button 
                        type="button"
                        onClick={addProductOffer}
                        className="text-xs font-bold text-brand-deep-pink hover:underline flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Add Offer</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 italic">These offers will be displayed on the product details page below the 'Add to Cart' button.</p>
                    <div className="space-y-4">
                      {(settings.product_offers || []).map((offer: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl group">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Offer Text</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Free Shipping Above ₹599"
                              value={offer}
                              onChange={e => updateProductOffer(idx, e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeProductOffer(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors mt-4"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold">Payment Methods</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <span className="font-bold text-xs">UPI</span>
                            </div>
                            <span className="font-bold">UPI Payments</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={settings.payment_upi || false}
                            onChange={e => setSettings({...settings, payment_upi: e.target.checked})}
                            className="w-6 h-6 accent-brand-gold"
                          />
                        </div>
                        
                        {settings.payment_upi && (
                          <div className="pt-4 border-t border-slate-200 space-y-4">
                            <label className="block text-sm font-bold">UPI QR Code (Scan to Pay)</label>
                            <div className="flex items-center space-x-4">
                              {settings.upi_qr_code && (
                                <img src={settings.upi_qr_code} alt="UPI QR" className="w-24 h-24 object-contain border border-slate-200 rounded-lg p-1 bg-white" referrerPolicy="no-referrer" />
                              )}
                              <div className="flex-1 space-y-2">
                                <input 
                                  type="text" 
                                  placeholder="QR Code URL"
                                  value={settings.upi_qr_code || ''}
                                  onChange={e => setSettings({...settings, upi_qr_code: cleanImageUrl(e.target.value)})}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                                />
                                <label className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl cursor-pointer transition-colors text-xs font-bold">
                                  <Upload size={14} />
                                  <span>Upload QR Code</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'upi_qr')} />
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold mb-2">Your UPI ID (Display under QR)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. yourname@okaxis"
                                value={settings.upi_id || ''}
                                onChange={e => setSettings({...settings, upi_id: e.target.value})}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="font-bold text-xs">COD</span>
                          </div>
                          <span className="font-bold">Cash on Delivery</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.payment_cod || false}
                          onChange={e => setSettings({...settings, payment_cod: e.target.checked})}
                          className="w-6 h-6 accent-brand-gold"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="font-bold text-xs">CARD</span>
                          </div>
                          <span className="font-bold">Credit/Debit Cards</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.payment_card || false}
                          onChange={e => setSettings({...settings, payment_card: e.target.checked})}
                          className="w-6 h-6 accent-brand-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-serif font-bold flex items-center space-x-2">
                      <Instagram size={20} className="text-brand-deep-pink" />
                      <span>Instagram Integration</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Instagram Access Token</label>
                        <input 
                          type="password" 
                          placeholder="Enter your Instagram Basic Display API Access Token"
                          value={settings.instagram_access_token || ''}
                          onChange={e => setSettings({...settings, instagram_access_token: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">
                          To show your live Instagram feed, you need a "Long-Lived Access Token" from the Instagram Basic Display API. 
                          If left empty, the website will show placeholder reference videos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-serif font-bold">Testimonials</h3>
                      <button 
                        type="button"
                        onClick={addTestimonial}
                        className="text-xs font-bold text-brand-deep-pink hover:underline flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Add Testimonial</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(settings.site_testimonials || []).map((t: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-100 rounded-2xl space-y-3 relative group">
                          <button 
                            type="button"
                            onClick={() => removeTestimonial(idx)}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              type="text" 
                              placeholder="Name"
                              value={t.name || ''}
                              onChange={e => updateTestimonial(idx, 'name', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Role"
                              value={t.role || ''}
                              onChange={e => updateTestimonial(idx, 'role', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                            />
                          </div>
                          <textarea 
                            rows={2}
                            placeholder="Testimonial content"
                            value={t.content || ''}
                            onChange={e => updateTestimonial(idx, 'content', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                          ></textarea>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 flex items-center space-x-2">
                              <input 
                                type="text" 
                                placeholder="Avatar URL"
                                value={t.avatar || ''}
                                onChange={e => updateTestimonial(idx, 'avatar', cleanImageUrl(e.target.value))}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 ring-brand-gold outline-none"
                              />
                              <label className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                                <Upload size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'testimonial_avatar', idx)} />
                              </label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] font-bold text-slate-400">Rating:</span>
                              <select 
                                value={t.rating || 5}
                                onChange={e => updateTestimonial(idx, 'rating', parseInt(e.target.value))}
                                className="text-xs border-none bg-slate-100 rounded px-1 py-0.5"
                              >
                                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="pink-button w-full flex items-center justify-center space-x-2">
                <Save size={20} />
                <span>Save All Settings</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-serif font-bold">{editingProduct?.id ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingProduct?.name || ''}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <select 
                      required
                      value={editingProduct?.category_id || ''}
                      onChange={e => setEditingProduct({...editingProduct, category_id: parseInt(e.target.value)})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Price (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={editingProduct?.price || ''}
                        onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Discount Price (₹)</label>
                      <input 
                        type="number" 
                        value={editingProduct?.discount_price || ''}
                        onChange={e => setEditingProduct({...editingProduct, discount_price: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Stock</label>
                    <input 
                      type="number" 
                      required
                      value={editingProduct?.stock || ''}
                      onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Product Image</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Image URL"
                        value={editingProduct?.image_url || ''}
                        onChange={e => setEditingProduct({...editingProduct, image_url: cleanImageUrl(e.target.value)})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold">
                          <Upload size={18} />
                          <span>From Computer</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'product')} />
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            setNotification({ 
                              message: 'Google Drive integration requires API configuration. Please provide a URL or upload from your computer.', 
                              type: 'error' 
                            });
                            setTimeout(() => setNotification(null), 5000);
                          }}
                          className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl transition-colors text-sm font-bold"
                        >
                          <Globe size={18} />
                          <span>From Drive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {editingProduct?.image_url && (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100">
                      <img src={editingProduct.image_url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl">
                    <input 
                      type="checkbox" 
                      id="is_featured"
                      checked={editingProduct?.is_featured || false}
                      onChange={e => setEditingProduct({...editingProduct, is_featured: e.target.checked})}
                      className="w-5 h-5 accent-brand-gold"
                    />
                    <label htmlFor="is_featured" className="font-bold">Feature on Homepage</label>
                  </div>

                  {/* Additional Images */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold">Additional Images</label>
                      <label className="text-xs font-bold text-brand-deep-pink hover:underline cursor-pointer flex items-center space-x-1">
                        <Plus size={14} />
                        <span>Add Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'additional')} />
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(editingProduct?.additional_images || []).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100">
                          <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = editingProduct?.additional_images?.filter((_, i) => i !== idx);
                              setEditingProduct({...editingProduct, additional_images: newImages});
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold">Videos (Upload or URL)</label>
                      <div className="flex space-x-3">
                        <label className="text-xs font-bold text-brand-deep-pink hover:underline cursor-pointer flex items-center space-x-1">
                          <Plus size={14} />
                          <span>Upload Video</span>
                          <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'video')} />
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            const newVideos = [...(editingProduct?.videos || []), ''];
                            setEditingProduct({...editingProduct, videos: newVideos});
                          }}
                          className="text-xs font-bold text-brand-deep-pink hover:underline flex items-center space-x-1"
                        >
                          <Plus size={14} />
                          <span>Add URL</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(editingProduct?.videos || []).map((video, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          {video.startsWith('data:video') ? (
                            <div className="flex-1 flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                              <div className="w-8 h-8 bg-brand-pink rounded flex items-center justify-center text-brand-deep-pink">
                                <Package size={16} />
                              </div>
                              <span className="text-xs font-medium truncate">Uploaded Video {idx + 1}</span>
                            </div>
                          ) : (
                            <input 
                              type="text" 
                              value={video}
                              onChange={e => {
                                const newVideos = [...(editingProduct?.videos || [])];
                                newVideos[idx] = e.target.value;
                                setEditingProduct({...editingProduct, videos: newVideos});
                              }}
                              placeholder="https://youtube.com/watch?v=..."
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 ring-brand-gold outline-none"
                            />
                          )}
                          <button 
                            type="button"
                            onClick={() => {
                              const newVideos = editingProduct?.videos?.filter((_, i) => i !== idx);
                              setEditingProduct({...editingProduct, videos: newVideos});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea 
                  rows={4}
                  required
                  value={editingProduct?.description || ''}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-8 py-3 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="pink-button flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-serif font-bold">{editingCategory?.id ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={editingCategory?.name || ''}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Parent Category (Optional)</label>
                <select 
                  value={editingCategory?.parent_id || ''}
                  onChange={e => setEditingCategory({...editingCategory, parent_id: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Category Image (Required for display cards)</label>
                <div className="flex items-center space-x-4">
                  {editingCategory?.image_url ? (
                    <img src={editingCategory.image_url} alt="Category" className="w-16 h-16 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200"><Image size={24} className="text-slate-400" /></div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      placeholder="Image URL"
                      value={editingCategory?.image_url || ''}
                      onChange={e => setEditingCategory({...editingCategory, image_url: cleanImageUrl(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 ring-brand-gold outline-none"
                    />
                    <label className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-bold">
                      <Upload size={14} />
                      <span>Upload Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'category_image')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="pink-button flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {croppingImage && (
        <ImageCropper
          image={croppingImage.src}
          aspect={croppingImage.aspect}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slide-up ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif font-bold mb-2">Are you sure?</h3>
              <p className="text-slate-500 text-sm">{confirmModal.message}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
