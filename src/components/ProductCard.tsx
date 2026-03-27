import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  key?: React.Key;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="premium-card group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
            }}
            className={`p-2 bg-white rounded-full shadow-lg transition-colors ${inWishlist ? 'text-brand-deep-pink' : 'text-slate-400 hover:text-brand-deep-pink'}`}
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-white text-brand-deep-pink py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xl hover:bg-brand-deep-pink hover:text-white transition-colors"
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{product.category_name || 'Collection'}</p>
        <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-brand-gold font-bold">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
