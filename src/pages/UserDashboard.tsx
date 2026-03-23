import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, Settings, LogOut, ChevronRight } from 'lucide-react';

export default function UserDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/orders/user/${user.id}`)
        .then(res => res.json())
        .then(setOrders);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-brand-gold text-white rounded-full flex items-center justify-center text-2xl font-serif font-bold">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-brand-pink text-brand-deep-pink font-bold rounded-2xl">
              <div className="flex items-center space-x-3">
                <Package size={20} />
                <span>My Orders</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all">
              <div className="flex items-center space-x-3 text-slate-600">
                <MapPin size={20} />
                <span>Addresses</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all">
              <div className="flex items-center space-x-3 text-slate-600">
                <Settings size={20} />
                <span>Settings</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => { logout(); onNavigate('home'); }}
              className="w-full flex items-center space-x-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
          
          {user.role === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')}
              className="w-full gold-button"
            >
              Admin Panel
            </button>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          <h1 className="text-3xl font-serif font-bold">Order History</h1>
          
          {orders.length === 0 ? (
            <div className="bg-slate-50 p-12 rounded-3xl text-center">
              <p className="text-slate-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-black/5 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full uppercase">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-bold text-brand-deep-pink">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
