import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw, Headphones, PhoneCall, Users, ShoppingBag, MapPin, Quote, Instagram } from 'lucide-react';
import InstagramFeed from '../components/InstagramFeed';

export default function HomePage({ onNavigate, onProductClick }: { onNavigate: (page: string) => void, onProductClick: (id: number) => void }) {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeArrivalCategory, setActiveArrivalCategory] = useState('Sarees');
  const [settings, setSettings] = useState<any>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/products/featured').then(res => res.json()),
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([featuredData, settingsData, categoriesData]) => {
      setFeatured(featuredData);
      setCategories(categoriesData);
      
      if (settingsData.hero_slides && typeof settingsData.hero_slides === 'string') {
        try {
          settingsData.hero_slides = JSON.parse(settingsData.hero_slides);
        } catch (e) {
          settingsData.hero_slides = [];
        }
      }
      if (settingsData.site_stats && typeof settingsData.site_stats === 'string') {
        try {
          settingsData.site_stats = JSON.parse(settingsData.site_stats);
        } catch (e) {
          settingsData.site_stats = [];
        }
      }
      if (settingsData.site_testimonials && typeof settingsData.site_testimonials === 'string') {
        try {
          settingsData.site_testimonials = JSON.parse(settingsData.site_testimonials);
        } catch (e) {
          settingsData.site_testimonials = [];
        }
      }
      setSettings(settingsData);
    });
  }, []);

  useEffect(() => {
    if (settings.hero_slides?.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % settings.hero_slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [settings.hero_slides]);

  useEffect(() => {
    let arrivalCats = [
      { id: 'Sarees', label: 'SAREES' },
      { id: 'Artificial Jewellery', label: 'JEWELLERY' }
    ];
    if (settings.arrival_categories) {
      arrivalCats = typeof settings.arrival_categories === 'string' ? JSON.parse(settings.arrival_categories) : settings.arrival_categories;
    }
    if (arrivalCats.length > 0 && !arrivalCats.find((c: any) => c.id === activeArrivalCategory)) {
      setActiveArrivalCategory(arrivalCats[0].id);
    }
  }, [settings.arrival_categories]);

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(activeArrivalCategory)}`)
      .then(res => res.json())
      .then(data => setNewArrivals(data.slice(0, 4)));
  }, [activeArrivalCategory]);

  const slides = settings.hero_slides || [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80'
  ];

  return (
    <div className="space-y-20 pb-20">
      <Helmet>
        <title>Ramshika | Buy Banarasi Silk Sarees & Kundan Jewellery Online India</title>
        <meta name="description" content="Shop premium Banarasi silk sarees, bridal sarees, Kanjeevaram sarees & Kundan artificial jewellery online at Ramshika. Authentic hand-woven Indian sarees with free shipping above ₹2000. 7-day easy returns. Order now!" />
        <meta name="keywords" content="banarasi silk saree online buy, kundan jewellery online india, bridal saree online shopping, hand woven silk saree, artificial jewellery jaipur, indian traditional saree online, wedding saree price, designer saree under 5000, ramshika" />
        <link rel="canonical" href="https://www.ramshika.com/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Ramshika",
            "image": "https://ui-avatars.com/api/?name=Ramshika&background=EAB308&color=fff&size=512",
            "description": "Premium Hand-Woven Sarees & Exquisite Artificial Jewellery",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Main Market",
              "addressLocality": "Varanasi",
              "addressRegion": "UP",
              "postalCode": "221001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 25.3176,
              "longitude": 82.9739
            },
            "url": "https://ais-pre-fydbyscctrbylw6sl2ot5r-236276710610.run.app/",
            "telephone": "+919876543210",
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "10:00",
                "closes": "20:00"
              }
            ],
            "sameAs": [
              "https://www.facebook.com/ramshika",
              "https://www.instagram.com/ramshika"
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        {slides.map((slide: string, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === idx ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={slide} 
              className="w-full h-full object-cover"
              alt={`Hero Slide ${idx + 1}`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          </motion.div>
        ))}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h2 className="text-brand-gold font-serif italic text-2xl mb-4">{settings.site_tagline || 'New Collection 2026'}</h2>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
              {settings.hero_title || 'Timeless Elegance Redefined.'}
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-lg">
              {settings.hero_subtitle || 'Discover our curated collection of hand-woven sarees and exquisite artificial jewellery designed for the modern Indian woman.'}
            </p>

            {/* Hero Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-8 border-t border-white/10">
              {settings.site_stats?.[0] && (
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <img 
                        key={i}
                        src={`https://i.pravatar.cc/100?u=user${i}`}
                        className="w-10 h-10 rounded-full border-2 border-brand-deep-pink object-cover"
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center text-brand-gold">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                      {settings.site_stats[0].value} {settings.site_stats[0].label}
                    </p>
                  </div>
                </div>
              )}

              {settings.site_testimonials?.[0] && (
                <div className="hidden md:flex items-center space-x-3 max-w-xs">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Quote size={16} className="text-brand-gold" />
                  </div>
                  <p className="text-xs italic text-slate-300 line-clamp-2">
                    "{settings.site_testimonials[0].content}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_: any, idx: number) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-brand-gold w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-black">Shop by Category</h2>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
        >
          {categories.filter(c => c.image_url).map(cat => (
            <div 
              key={cat.id}
              onClick={() => onNavigate(`category-${encodeURIComponent(cat.name)}`)}
              className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={cat.image_url!} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={cat.name} 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-3xl font-serif font-bold mb-2 drop-shadow-lg">{cat.name}</h3>
                <p className="tracking-widest uppercase text-sm font-medium opacity-90">Shop Now →</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-serif font-bold mb-8">New Arrivals</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(settings.arrival_categories ? (typeof settings.arrival_categories === 'string' ? JSON.parse(settings.arrival_categories) : settings.arrival_categories) : [
              { id: 'Sarees', label: 'SAREES' },
              { id: 'Artificial Jewellery', label: 'JEWELLERY' }
            ]).map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveArrivalCategory(cat.id)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeArrivalCategory === cat.id
                    ? 'bg-brand-deep-pink text-white shadow-lg'
                    : 'bg-[#FDF2F2] text-slate-800 hover:bg-brand-pink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <div 
              key={product.id}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group cursor-pointer shadow-md"
              onClick={() => onProductClick(product.id)}
            >
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-[#A65D61] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                  Hot Selling
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-serif font-bold text-xl mb-1">{product.name}</h3>
                <p className="text-brand-gold font-bold">₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
          {newArrivals.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">
              New arrivals coming soon for this category...
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-2">Featured Collection</h2>
            <p className="text-slate-500">Handpicked pieces just for you</p>
          </div>
          <button 
            onClick={() => onNavigate('category-all')}
            className="text-brand-deep-pink font-bold flex items-center space-x-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      {settings.site_stats && settings.site_stats.length > 0 && (
        <section className="bg-brand-deep-pink py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {settings.site_stats.map((stat: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center text-white space-y-2"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {stat.icon === 'Users' && <Users size={24} />}
                    {stat.icon === 'ShoppingBag' && <ShoppingBag size={24} />}
                    {stat.icon === 'MapPin' && <MapPin size={24} />}
                    {stat.icon === 'Star' && <Star size={24} />}
                  </div>
                  <div className="text-4xl font-serif font-bold">{stat.value}</div>
                  <div className="text-sm uppercase tracking-widest opacity-80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {settings.site_testimonials && settings.site_testimonials.length > 0 && (
        <section className="bg-slate-50 py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4">What Our Customers Say</h2>
              <div className="w-24 h-1 bg-brand-gold mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {settings.site_testimonials.map((t: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative"
                >
                  <Quote className="absolute top-6 right-8 text-slate-100" size={48} />
                  <div className="flex space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < (t.rating || 5) ? "fill-brand-gold text-brand-gold" : "text-slate-200"} 
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 italic mb-8 relative z-10">"{t.content}"</p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={t.avatar || `https://i.pravatar.cc/150?u=${idx}`} 
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-pink"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      <InstagramFeed accessToken={settings.instagram_access_token} />

      {/* Trust Badges */}
      <section className="bg-brand-pink py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                <Truck size={24} />
              </div>
              <h4 className="font-bold">Free Shipping</h4>
              <p className="text-xs text-slate-500">On orders above ₹2000</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold">Secure Payment</h4>
              <p className="text-xs text-slate-500">100% safe transactions</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                <RotateCcw size={24} />
              </div>
              <h4 className="font-bold">Easy Returns</h4>
              <p className="text-xs text-slate-500">7-day return policy</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                <Star size={24} />
              </div>
              <h4 className="font-bold">Premium Quality</h4>
              <p className="text-xs text-slate-500">Authentic craftsmanship</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
