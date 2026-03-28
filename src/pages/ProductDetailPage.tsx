import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingBag, Heart, Share2, Truck, ShieldCheck, RotateCcw, Minus, Plus, Percent, TrendingDown, Package, User } from 'lucide-react';

export default function ProductDetailPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user, token } = useAuth();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [productOffers, setProductOffers] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${productId}`).then(res => res.json()),
      fetch('/api/settings').then(res => res.json()),
      fetch(`/api/products/${productId}/reviews`).then(res => res.json())
    ]).then(([productData, settingsData, reviewsData]) => {
      setProduct(productData);
      setActiveImage(productData.image_url);
      
      try {
        if (settingsData.product_offers) {
          const parsed = typeof settingsData.product_offers === 'string' 
            ? JSON.parse(settingsData.product_offers) 
            : settingsData.product_offers;
          setProductOffers(parsed);
        }
      } catch (e) {
        console.error('Failed to parse product offers', e);
      }
      
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
      }
      setLoading(false);
    });
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setReviewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const allImages = [product.image_url, ...(product.additional_images || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{`Buy ${product.name} Online | Ramshika`}</title>
        <meta name="description" content={`${product.description.substring(0, 140)} Shop ${product.name} online at Ramshika. Free shipping above ₹2000.`} />
        <meta name="keywords" content={`${product.name}, ${product.category_name || 'saree'} online india, buy ${product.category_name || 'saree'} online, ramshika`} />
        <link rel="canonical" href={`https://www.ramshika.com/product/${product.id}`} />
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

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-[#F472B6] hover:bg-[#EC4899] text-white font-bold py-4 rounded-lg transition-all uppercase tracking-wider text-sm active:scale-95"
            >
              ADD TO CART
            </button>
            <button
              onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
              className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                isInWishlist(product.id) 
                  ? 'border-brand-deep-pink bg-brand-pink text-brand-deep-pink' 
                  : 'border-slate-200 text-slate-400 hover:border-brand-deep-pink hover:text-brand-deep-pink'
              }`}
            >
              <Heart size={24} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Offers Section */}
          {productOffers.length > 0 && (
            <div className="border border-[#F472B6] rounded-2xl p-4 bg-white space-y-3">
              {productOffers.map((offer, idx) => (
                <div key={idx} className="bg-[#FDF2F2] p-3 rounded-xl flex items-center space-x-3">
                  <div className="bg-[#F472B6] text-white p-1.5 rounded-full flex-shrink-0">
                    <Percent size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{offer}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.category_name?.toLowerCase().includes('jewellery') || product.category_id === 2 ? (
            <div className="grid grid-cols-2 gap-y-6 gap-x-6 pt-8 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="border border-slate-400 rounded-full p-1 opacity-80"><Percent size={18} /></div>
                <span className="text-sm text-slate-800 tracking-wide font-medium">100% Purchase Protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="border border-slate-400 rounded-full p-1 opacity-80"><RotateCcw size={18} /></div>
                <span className="text-sm text-slate-800 tracking-wide leading-tight font-medium">This product is not returnable</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="border border-slate-400 rounded-full p-1 opacity-80"><Star size={18} /></div>
                <span className="text-sm text-slate-800 tracking-wide font-medium">Assured Quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="border border-slate-400 rounded-full p-1 opacity-80"><Package size={18} /></div>
                <span className="text-sm text-slate-800 tracking-wide font-medium">Free shipping*</span>
              </div>
            </div>
          ) : (
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
          )}
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

      {/* Reviews Section */}
      <div className="mt-16 pt-12 border-t border-slate-100 mb-20">
        <h3 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-slate-50 p-6 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                      {review.user_name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{review.user_name}</p>
                      <div className="flex text-[#FFB800]">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= review.rating ? "currentColor" : "none"} className={i <= review.rating ? "text-[#FFB800]" : "text-slate-300"} />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700">{review.comment}</p>
                  <p className="text-xs text-slate-400 mt-3">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
              <h4 className="text-xl font-serif font-bold mb-6">Write a Review</h4>
              
              {!user ? (
                <div className="text-center p-6 bg-slate-50 rounded-2xl">
                  <p className="text-slate-600 mb-4">You need to be logged in to write a review.</p>
                </div>
              ) : reviewSubmitted ? (
                <div className="p-6 bg-green-50 text-green-700 rounded-2xl border border-green-200 text-center">
                  <Star className="inline-block mb-2 text-green-500" size={32} />
                  <p className="font-bold">Thank you for your review!</p>
                  <p className="text-sm mt-1">Your review has been submitted and is awaiting approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            size={28} 
                            fill={star <= reviewRating ? "currentColor" : "none"} 
                            className={star <= reviewRating ? "text-[#FFB800]" : "text-slate-300"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                    <textarea 
                      required
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ring-brand-deep-pink min-h-[120px]"
                      placeholder="What did you like or dislike?"
                    ></textarea>
                  </div>
                  <button type="submit" className="pink-button w-full">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
