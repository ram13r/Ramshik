import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
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
import WishlistPage from './pages/WishlistPage';
import BlogPage from './pages/BlogPage';
import ChatWidget from './components/ChatWidget';
import CartDrawer from './components/CartDrawer';
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
          {currentPage.startsWith('category-') && currentPage !== 'category-all' && (
            <CategoryPage 
              category={decodeURIComponent(currentPage.replace('category-', ''))} 
              onProductClick={openProduct} 
            />
          )}
          {currentPage === 'product-detail' && selectedProductId && <ProductDetailPage productId={selectedProductId} />}
          {currentPage === 'cart' && <CartPage onNavigate={navigate} />}
          {currentPage === 'wishlist' && <WishlistPage onNavigate={navigate} onProductClick={openProduct} />}
          {currentPage === 'checkout' && <CheckoutPage onNavigate={navigate} />}
          {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
          {currentPage === 'dashboard' && <UserDashboard onNavigate={navigate} />}
          {currentPage === 'admin' && user?.role !== 'admin' && (
            <div className="py-20 text-center">
               <h2 className="text-2xl font-bold text-red-500 mb-4">Unauthorized Access</h2>
               <p className="text-slate-500 mb-6">You do not have permission to view the admin panel.</p>
               <button onClick={() => navigate('home')} className="pink-button">Return Home</button>
            </div>
          )}
          {currentPage === 'blog' && <BlogPage onNavigate={navigate} onProductClick={openProduct} />}
          {currentPage === 'about' && (
            <StaticPage title="About Ramshika" content="Ramshika is a premium Indian fashion brand dedicated to bringing the timeless grace of sarees and artisanal jewellery to the modern woman.">
              <p className="mb-6 text-lg"><strong className="text-brand-deep-pink font-serif text-xl">Ramshika</strong> is a premium Indian fashion brand dedicated to bringing the timeless grace of sarees and artisanal jewellery to the modern woman. Our journey started with a simple vision: to celebrate Indian craftsmanship and make it accessible to everyone.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Our Craftsmanship</h3>
              <p className="mb-6">Every piece in our collection is handpicked for its quality, design, and cultural significance. From the intricate weaves of Banarasi and Kanjeevaram silk to the delicate shimmer of Kundan and temple jewellery, Ramshika represents the pure soul of Indian heritage.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Our Philosophy</h3>
              <p className="mb-6">We believe that a saree is not just an attire; it's a story of grace, tradition, and identity passed down through generations. Our mission is to help you find your unique story in every fold of our carefully curated sarees.</p>
            </StaticPage>
          )}
          {currentPage === 'contact' && <ContactPage />}
          {currentPage === 'shipping' && (
            <StaticPage title="Shipping Policy" content="At Ramshika, we strive to deliver your hand-woven sarees and artisanal jewellery securely and on time.">
              <p className="mb-8 text-lg">At <strong>Ramshika</strong>, we strive to deliver your hand-woven sarees and artisanal jewellery securely and on time.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Processing Time</h3>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>All standard orders are processed and dispatched within <strong>1-2 business days</strong>.</li>
                <li>Custom tailoring, pico/fall services, or heavy bridal orders may take <strong>5-7 days</strong> for dispatch.</li>
                <li>Orders are not shipped or delivered on weekends or public holidays.</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Shipping Rates & Estimates</h3>
              <p className="mb-4">Shipping charges for your order will be calculated and displayed at checkout.</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li><strong>Free Standard Delivery:</strong> On all orders over ₹2,000 within India.</li>
                <li><strong>Standard Flat Fee:</strong> For orders below ₹2,000, a flat shipping fee applies depending on the package weight.</li>
                <li><strong>Delivery Timeline:</strong> Domestic shipping across India typically takes <strong>3-7 business days</strong> depending on your location. Delivery to remote areas may take up to 10 days.</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Order Tracking</h3>
              <p className="mb-8">Once your order is shipped, you will receive an email and SMS with the tracking ID and a direct link to track your shipment's progress in real-time.</p>
            </StaticPage>
          )}

          {currentPage === 'returns' && (
            <StaticPage title="Return & Refund Policy" content="We stand by the quality of our craftsmanship. If you are not completely satisfied with your purchase, our Return & Refund policy ensures a smooth process.">
              <p className="mb-8 text-lg">We stand by the quality of our craftsmanship. If you are not completely satisfied with your purchase, our Return & Refund policy ensures a smooth and transparent process.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Returns</h3>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>You have <strong>7 days</strong> after receiving your item to request a return.</li>
                <li>The item must be unused, unwashed, in its original packaging, and with all tags intact.</li>
                <li><strong>Exclusions:</strong> Sarees that have had falls or pico stitched, customized blouses, and worn jewellery cannot be returned or exchanged for hygiene and customization reasons.</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Refunds</h3>
              <p className="mb-4">Once we receive and inspect your return, we will send you an email to notify you of the approval or rejection of your refund.</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li><strong>Prepaid Orders:</strong> Approved refunds will be processed directly to your original method of payment within 5-7 business days.</li>
                <li><strong>COD Orders:</strong> Refunds for Cash on Delivery orders will be processed via bank transfer to an account provided by you.</li>
                <li>Original shipping charges are non-refundable.</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Damaged Items</h3>
              <p className="mb-8">If you receive a defective or damaged product, please contact us within <strong>48 hours</strong> of delivery with photographic/video evidence. We will arrange a free reverse pickup and expedited replacement.</p>
            </StaticPage>
          )}

          {currentPage === 'privacy' && (
            <StaticPage title="Privacy Policy" content="Your privacy is important to Ramshika. We are committed to protecting your personal data and ensuring a secure shopping experience.">
              <p className="mb-8 text-lg">Your privacy is important to <strong>Ramshika</strong>. We are committed to protecting your personal data and ensuring a secure shopping experience across our platform.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Information We Collect</h3>
              <p className="mb-4">When you make a purchase or sign up for an account, we collect necessary personal information to process your order:</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>Name, Email address, and Phone number</li>
                <li>Billing and Shipping addresses</li>
                <li>Account preferences and order history</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">How We Use Your Data</h3>
              <p className="mb-4">We use your information solely for the following purposes:</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>To fulfill orders and provide customer support</li>
                <li>To send transactional emails/SMS (order confirmations, tracking updates)</li>
                <li>To improve our website design and product offerings</li>
                <li>We <strong>never</strong> sell or rent your personal data to third-party data brokers.</li>
              </ul>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Payment Security</h3>
              <p className="mb-8">Your payment information is heavily encrypted and securely processed by our regulated payment gateway partners (Razorpay). <strong>We do not store your credit card numbers or UPI PINs on our servers.</strong> All transactions meet strict industry security standards.</p>
            </StaticPage>
          )}

          {currentPage === 'terms' && (
            <StaticPage title="Terms of Service" content="By accessing and placing an order with Ramshika, you confirm that you are in agreement with and bound by these Terms of Service.">
              <p className="mb-8 text-lg">By accessing and placing an order with <strong>Ramshika</strong>, you confirm that you are in agreement with and bound by these Terms of Service.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4 mt-8">Products, Colors & Variability</h3>
              <p className="mb-8">We make every effort to display as accurately as possible the colors and images of our products. However, due to the <strong>hand-woven nature</strong> of our silk and cotton fabrics, as well as differences in monitor displays, slight variations in color, texture, and weave may occur. These minor irregularities are not defects but a hallmark of genuine handloom products.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">Pricing & Availability</h3>
              <p className="mb-8">Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product or service without liability. All orders are subject to availability and confirmation of the order price.</p>
              
              <h3 className="text-2xl font-serif font-bold text-brand-black mb-4">User Conduct</h3>
              <p className="mb-4">As a user of this website, you agree not to:</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service or our product designs.</li>
                <li>Use our products for any illegal or unauthorized purpose.</li>
                <li>Transmit any worms, viruses, or code of a destructive nature.</li>
              </ul>
            </StaticPage>
          )}
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
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate(`category-${encodeURIComponent('Sarees')}`)}>Sarees</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate(`category-${encodeURIComponent('Artificial Jewellery')}`)}>Jewellery</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('blog')}>Fashion Blog</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('about')}>About Us</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('contact')}>Contact Us</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-6">Policies</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('shipping')}>Shipping Policy</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('returns')}>Return & Refund</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('privacy')}>Privacy Policy</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('terms')}>Terms of Service</li>
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
        <CartDrawer onNavigate={navigate} />
        <ChatWidget />
        {/* WhatsApp Floating Button — bottom-left, above footer level */}
        <a
          href="https://api.whatsapp.com/send?phone=919876543210&text=Hello%20Ramshika!%20I%20have%20a%20query."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 z-50 flex flex-row-reverse items-center space-x-2 space-x-reverse bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-all duration-300 group"
          title="Chat with us on WhatsApp"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-[6rem] transition-all duration-300 whitespace-nowrap">Chat with us</span>
        </a>
      </div>
    );
  };

  return renderPage();
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
