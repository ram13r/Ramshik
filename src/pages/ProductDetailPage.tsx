import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag, Heart, Share2, Truck, ShieldCheck, RotateCcw, Minus, Plus, Percent, TrendingDown } from 'lucide-react';

export default function ProductDetailPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setActiveImage(data.image_url);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const allImages = [product.image_url, ...(product.additional_images || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{`${product.name} | Ramshika`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.image_url,
            "description": product.description,
            "brand": {
              "@type": "Brand",
              "name": "Ramshika"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "INR",
              "price": product.price,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] no-scrollbar">
            {allImages.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setActiveImage(img)}
                className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden bg-slate-100 cursor-pointer transition-all ${activeImage === img ? 'ring-2 ring-brand-gold' : 'hover:ring-2 ring-slate-200'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
            {product.discount_price && product.price < product.discount_price && (
              <div className="absolute top-4 left-4 z-10 bg-[#A65D61] text-white px-3 py-1 rounded-md text-sm font-bold">
                -{Math.round(((product.discount_price - product.price) / product.discount_price) * 100)}%
              </div>
            )}
            <img 
              src={activeImage || product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex text-[#FFB800]">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= 4 ? "currentColor" : "none"} className={i <= 4 ? "text-[#FFB800]" : "text-slate-300"} />)}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="bg-[#E6F9F1] text-[#2D3A3A] px-4 py-3 rounded-md flex items-center space-x-2 mb-6">
              <TrendingDown size={18} className="text-[#4CAF50]" />
              <span className="text-sm font-medium">Lowest price in last 30 days</span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <p className="text-4xl text-[#F472B6] font-bold">Rs. {product.price.toLocaleString('en-IN')}.00</p>
              {product.discount_price && product.price < product.discount_price && (
                <p className="text-xl text-slate-400 line-through">Rs. {product.discount_price.toLocaleString('en-IN')}.00</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-slate-200 rounded-lg bg-[#F8FAFC]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-slate-100 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="px-6 font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-slate-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => addToCart({ ...product, quantity })}
              className="w-full bg-[#F472B6] hover:bg-[#EC4899] text-white font-bold py-4 rounded-lg transition-all uppercase tracking-wider text-sm"
            >
              ADD TO CART
            </button>
          </div>

          {/* Offers Section */}
          <div className="border border-[#F472B6] rounded-2xl p-4 bg-white space-y-3">
            <div className="bg-[#FDF2F2] p-3 rounded-xl flex items-center space-x-3">
              <div className="bg-[#F472B6] text-white p-1.5 rounded-full">
                <Percent size={14} />
              </div>
              <span className="text-sm font-medium text-slate-800">Free Shipping Above ₹599</span>
            </div>
            <div className="bg-[#FDF2F2] p-3 rounded-xl flex items-center space-x-3">
              <div className="bg-[#F472B6] text-white p-1.5 rounded-full">
                <Percent size={14} />
              </div>
              <span className="text-sm font-medium text-slate-800">Free gift on shopping above ₹699</span>
            </div>
            <div className="bg-[#FDF2F2] p-3 rounded-xl flex items-center space-x-3">
              <div className="bg-[#F472B6] text-white p-1.5 rounded-full">
                <Percent size={14} />
              </div>
              <span className="text-sm font-medium text-slate-800">Free organiser on shopping above ₹1199</span>
            </div>
            <div className="bg-[#FDF2F2] p-3 rounded-xl flex items-center space-x-3">
              <div className="bg-[#F472B6] text-white p-1.5 rounded-full">
                <Percent size={14} />
              </div>
              <span className="text-sm font-medium text-slate-800">Get ₹100 off on shopping above ₹1499</span>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center space-x-3">
              <Truck className="text-brand-gold" size={24} />
              <div className="text-xs">
                <p className="font-bold">Free Delivery</p>
                <p className="text-slate-500">On orders over ₹2000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="text-brand-gold" size={24} />
              <div className="text-xs">
                <p className="font-bold">7 Days Return</p>
                <p className="text-slate-500">Easy exchange policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="text-brand-gold" size={24} />
              <div className="text-xs">
                <p className="font-bold">Secure Checkout</p>
                <p className="text-slate-500">UPI, Cards, COD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      {product.videos && product.videos.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-100">
          <h3 className="text-2xl font-serif font-bold mb-8">Product Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.videos.map((video, idx) => {
              if (video.startsWith('data:video')) {
                return (
                  <div key={idx} className="aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
                    <video 
                      src={video} 
                      controls 
                      className="w-full h-full"
                    />
                  </div>
                );
              }

              // Basic YouTube embed logic
              let embedUrl = video;
              if (video.includes('youtube.com/watch?v=')) {
                embedUrl = video.replace('watch?v=', 'embed/');
              } else if (video.includes('youtu.be/')) {
                embedUrl = video.replace('youtu.be/', 'youtube.com/embed/');
              }
              
              return (
                <div key={idx} className="aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
                  <iframe 
                    src={embedUrl}
                    className="w-full h-full"
                    title={`Product Video ${idx + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
