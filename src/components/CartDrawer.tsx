import React, { useEffect } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, total } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate Subtotal (MRP sum) and Discount (MRP sum - Total)
  const mrpTotal = cart.reduce((sum, item) => {
    const itemMrp = (item.discount_price && item.discount_price > item.price) ? item.discount_price : item.price;
    return sum + (itemMrp * item.quantity);
  }, 0);

  const discountOnMrp = mrpTotal - total;

  useEffect(() => {
    // Prevent background scrolling when cart is open
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const navigateTo = (path: string) => {
    setIsCartOpen(false);
    onNavigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-[400px] bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-xl font-serif font-bold text-slate-900">Your Cart</h2>
            <span className="text-sm text-slate-500">Items {cartCount}</span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Close Cart"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <p>Your cart is empty.</p>
              <button 
                onClick={() => navigateTo('home')}
                className="text-brand-deep-pink font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const mrp = (item.discount_price && item.discount_price > item.price) ? item.discount_price : item.price;
              const hasDiscount = mrp > item.price;
              const discountPercent = hasDiscount ? Math.round(((mrp - item.price) / mrp) * 100) : 0;

              return (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-32 bg-slate-50 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigateTo('product-detail')}>
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        className="text-sm font-medium text-slate-900 line-clamp-2 cursor-pointer hover:text-brand-deep-pink transition-colors"
                        onClick={() => navigateTo('product-detail')}
                      >
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                      {hasDiscount && (
                        <>
                          <span className="text-xs text-slate-400 line-through">MRP ₹{mrp.toLocaleString('en-IN')}</span>
                          <span className="text-xs font-bold text-[#E53E3E]">{discountPercent}% OFF</span>
                        </>
                      )}
                    </div>

                    {/* Quantity Control */}
                    <div className="mt-auto pt-4 flex items-center">
                      <div className="flex items-center border border-slate-200 rounded">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-slate-100 p-4 md:p-6 space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{mrpTotal.toLocaleString('en-IN')}</span>
              </div>
              {discountOnMrp > 0 && (
                <div className="flex justify-between font-medium text-[#E53E3E]">
                  <span>Discount on MRP</span>
                  <span>- ₹{discountOnMrp.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Estimated total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => navigateTo('checkout')}
                className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3.5 tracking-wider uppercase text-sm transition-colors"
                aria-label="Secure Checkout"
              >
                CHECKOUT
              </button>
              <button 
                onClick={() => navigateTo('cart')}
                className="w-full bg-white text-black border border-black hover:bg-gray-50 font-bold py-3.5 tracking-wider uppercase text-sm transition-colors"
              >
                VIEW CART
              </button>
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-500 mb-2">
                By clicking on checkout you are agreeing to <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigateTo('returns')}>Return Policy</span>.
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">We Accept</span>
                <div className="flex gap-1.5 opacity-80">
                  {/* Visa */}
                  <div className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center text-[8px] font-bold text-blue-800">VISA</div>
                  {/* Mastercard */}
                  <div className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full -mr-1 mix-blend-multiply"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mix-blend-multiply"></div>
                  </div>
                  {/* Amex */}
                  <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-[7px] font-bold text-white">AMEX</div>
                  {/* COD */}
                  <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-[7px] font-bold text-white leading-tight text-center">Cash on<br/>Delivery</div>
                  {/* UPI */}
                  <div className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center text-[8px] font-bold text-green-700 italic border border-slate-200">UPI</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
