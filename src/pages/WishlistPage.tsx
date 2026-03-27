import React from 'react';
import { ShoppingBag, Trash2, HeartCrack } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage({ onNavigate, onProductClick }: { onNavigate: (page: string) => void, onProductClick: (id: number) => void }) {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">My Wishlist</h1>
        <p className="text-slate-500">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <HeartCrack size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-serif font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-6 max-w-sm text-center">Save items you love to your wishlist to easily find and purchase them later.</p>
          <button 
            onClick={() => onNavigate('home')}
            className="pink-button"
          >
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.product_id} className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div 
                className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                onClick={() => onProductClick(item.product_id)}
              >
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.product_id); }}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-brand-deep-pink hover:bg-brand-pink transition-colors z-10 shadow-sm"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 
                  className="font-medium text-slate-900 mb-1 cursor-pointer hover:text-brand-deep-pink transition-colors line-clamp-2"
                  onClick={() => onProductClick(item.product_id)}
                >
                  {item.name}
                </h3>
                
                <div className="flex items-center space-x-2 mt-auto pt-4 mb-4">
                  <span className="font-bold text-lg">₹{item.price.toLocaleString('en-IN')}</span>
                  {item.discount_price && item.discount_price > item.price && (
                    <span className="text-sm text-slate-400 line-through">₹{item.discount_price.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <button 
                  onClick={() => handleAddToCart({ id: item.product_id, name: item.name, price: item.price, discount_price: item.discount_price, image_url: item.image_url })}
                  className="w-full pink-button py-2 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={16} />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
