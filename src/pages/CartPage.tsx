import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-deep-pink">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="gold-button"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold mb-12">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <div key={item.id} className="flex items-center space-x-6 p-6 bg-white border border-black/5 rounded-2xl">
              <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold mb-1">{item.name}</h3>
                <p className="text-brand-gold font-bold mb-4">₹{item.price.toLocaleString('en-IN')}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-brand-pink p-8 rounded-3xl space-y-6">
            <h3 className="text-2xl font-serif font-bold">Order Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="pt-4 border-t border-black/5 flex justify-between text-xl">
                <span className="font-serif font-bold">Total</span>
                <span className="font-bold text-brand-deep-pink">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full pink-button flex items-center justify-center space-x-2 py-4"
            >
              <span>Checkout</span>
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="p-6 border border-slate-200 rounded-2xl">
            <p className="text-sm font-bold mb-2">Apply Coupon</p>
            <div className="flex space-x-2">
              <input type="text" placeholder="Enter code" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-brand-gold" />
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
