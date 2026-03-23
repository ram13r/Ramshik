import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Search, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { cart } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search:${searchQuery.trim()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer group flex items-center space-x-3"
            onClick={() => onNavigate('home')}
          >
            {settings.site_logo ? (
              <img 
                src={settings.site_logo} 
                alt={settings.site_name} 
                referrerPolicy="no-referrer"
                className={`w-auto object-contain transition-all ${
                  settings.logo_size === 'small' ? 'h-12' : 
                  settings.logo_size === 'medium' ? 'h-20' :
                  settings.logo_size === 'large' ? 'h-32' : 
                  settings.logo_size === 'xl' ? 'h-48' : 'h-20'
                }`} 
              />
            ) : (
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-wider text-brand-deep-pink group-hover:text-brand-gold transition-colors">
                  {settings.site_name || 'RAMSHIKA'}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium -mt-1">
                  {settings.site_tagline || 'Grace in Every Saree'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-brand-gold transition-colors">HOME</button>
            <button onClick={() => onNavigate('category-sarees')} className="text-sm font-medium hover:text-brand-gold transition-colors">SAREES</button>
            <button onClick={() => onNavigate('category-jewellery')} className="text-sm font-medium hover:text-brand-gold transition-colors">JEWELLERY</button>
            <button onClick={() => onNavigate('about')} className="text-sm font-medium hover:text-brand-gold transition-colors">ABOUT</button>
            <button onClick={() => onNavigate('contact')} className="text-sm font-medium hover:text-brand-gold transition-colors">CONTACT</button>
            {user?.role === 'admin' && (
              <button onClick={() => onNavigate('admin')} className="text-sm font-bold text-brand-deep-pink hover:text-brand-gold transition-colors">ADMIN</button>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button 
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center space-x-1 text-xs font-bold border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
            >
              <Globe size={14} />
              <span>{lang}</span>
            </button>
            
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-100 border-none rounded-full px-4 py-2 text-sm w-48 focus:ring-1 ring-brand-gold outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 text-slate-400 hover:text-brand-deep-pink"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:text-brand-gold transition-colors"
              >
                <Search size={20} />
              </button>
            )}
            
            <button 
              onClick={() => onNavigate(user ? 'dashboard' : 'login')}
              className="p-2 hover:text-brand-gold transition-colors relative"
            >
              <User size={20} />
              {user && <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>}
            </button>
            
            <button className="p-2 hover:text-brand-gold transition-colors">
              <Heart size={20} />
            </button>
            
            <button 
              onClick={() => onNavigate('cart')}
              className="p-2 hover:text-brand-gold transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-deep-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/5 px-4 py-6 space-y-4">
          <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif">Home</button>
          <button onClick={() => { onNavigate('category-sarees'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif">Sarees</button>
          <button onClick={() => { onNavigate('category-jewellery'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif">Jewellery</button>
          <button onClick={() => { onNavigate('about'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif">About Us</button>
          <button onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif">Contact Us</button>
          {user?.role === 'admin' && (
            <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} className="block w-full text-left text-lg font-serif text-brand-deep-pink font-bold">Admin Panel</button>
          )}
        </div>
      )}
    </nav>
  );
}
