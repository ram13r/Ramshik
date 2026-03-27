import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistItem {
  product_id: number;
  name: string;
  price: number;
  discount_price?: number;
  image_url: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlist(data);
        }
      })
      .catch(console.error);
    } else {
      setWishlist([]);
    }
  }, [user, token]);

  const addToWishlist = async (product: any) => {
    if (!user || !token) return;
    
    // Optimistic UI update
    const newItem: WishlistItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      image_url: product.image_url
    };
    
    if (!wishlist.some(w => w.product_id === product.id)) {
      setWishlist(prev => [...prev, newItem]);
    }

    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id })
      });
    } catch (error) {
      console.error('Failed to add to wishlist', error);
      // Rollback on failure could be implemented here
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user || !token) return;
    
    setWishlist(prev => prev.filter(item => item.product_id !== productId));
    
    try {
      await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
