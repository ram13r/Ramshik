import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaticPage from './pages/StaticPage';
import ContactPage from './pages/ContactPage';
import ChatWidget from './components/ChatWidget';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { user } = useAuth();

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const openProduct = (id: number) => {
    setSelectedProductId(id);
    navigate('product-detail');
  };

  const renderPage = () => {
    if (currentPage === 'admin' && user?.role === 'admin') return <AdminDashboard />;
    
    const isSearch = currentPage.startsWith('search:');
    const searchQuery = isSearch ? currentPage.split(':')[1] : '';

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onNavigate={navigate} />
        <main className="flex-grow">
          {currentPage === 'home' && <HomePage onNavigate={navigate} onProductClick={openProduct} />}
          {isSearch && <CategoryPage category={`Search: ${searchQuery}`} searchQuery={searchQuery} onProductClick={openProduct} />}
          {currentPage === 'category-all' && <CategoryPage category="All Products" onProductClick={openProduct} />}
          {currentPage === 'category-sarees' && <CategoryPage category="Sarees" onProductClick={openProduct} />}
          {currentPage === 'category-jewellery' && <CategoryPage category="Artificial Jewellery" onProductClick={openProduct} />}
          {currentPage === 'product-detail' && selectedProductId && <ProductDetailPage productId={selectedProductId} />}
          {currentPage === 'cart' && <CartPage onNavigate={navigate} />}
          {currentPage === 'checkout' && <CheckoutPage onNavigate={navigate} />}
          {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
          {currentPage === 'dashboard' && <UserDashboard onNavigate={navigate} />}
          {currentPage === 'about' && <StaticPage title="About Ramshika" content="Ramshika is a premium Indian fashion brand dedicated to bringing the timeless grace of sarees and artisanal jewellery to the modern woman. Our journey started with a simple vision: to celebrate Indian craftsmanship and make it accessible to everyone.\n\nEvery piece in our collection is handpicked for its quality, design, and cultural significance. From the intricate weaves of Banarasi silk to the delicate shimmer of Kundan jewellery, Ramshika represents the soul of Indian heritage.\n\nWe believe that a saree is not just an attire; it's a story of grace, tradition, and identity. Our mission is to help you find your story in every fold of our sarees." />}
          {currentPage === 'contact' && <ContactPage />}
        </main>
        
        <footer className="bg-slate-900 text-white pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-brand-gold">RAMSHIKA</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Grace in Every Saree. Premium Indian fashion brand specializing in hand-woven sarees and artisanal jewellery.
                </p>
                <div className="flex space-x-4">
                  <Instagram className="hover:text-brand-gold cursor-pointer transition-colors" />
                  <Facebook className="hover:text-brand-gold cursor-pointer transition-colors" />
                  <Twitter className="hover:text-brand-gold cursor-pointer transition-colors" />
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-6">Quick Links</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('home')}>Home</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('category-sarees')}>Sarees</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('category-jewellery')}>Jewellery</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('about')}>About Us</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('contact')}>Contact Us</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-6">Policies</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="hover:text-white cursor-pointer">Shipping Policy</li>
                  <li className="hover:text-white cursor-pointer">Return & Refund</li>
                  <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                  <li className="hover:text-white cursor-pointer">Terms of Service</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-6">Newsletter</h4>
                <p className="text-slate-400 text-sm mb-4">Subscribe to get special offers and collection updates.</p>
                <div className="flex">
                  <input type="email" placeholder="Your email" className="bg-slate-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 ring-brand-gold outline-none" />
                  <button className="bg-brand-gold text-white px-4 py-2 rounded-r-lg font-bold">Join</button>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
              <p>&copy; 2026 Ramshika Fashion. All rights reserved.</p>
            </div>
          </div>
        </footer>
        <ChatWidget />
      </div>
    );
  };

  return renderPage();
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
