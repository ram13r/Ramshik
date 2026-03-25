import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, CheckCircle2, Smartphone, AlertCircle, QrCode, Lock } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  // Guard: Protect checkout logic requiring sign in
  if (!user && step !== 3 && step !== 4) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={48} />
        </div>
        <h2 className="text-4xl font-serif font-bold mb-4">Login Required</h2>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto">Please sign in or create an account to securely process your payment and track your order.</p>
        <button 
          onClick={() => onNavigate('login')}
          className="gold-button"
        >
          Sign In / Register
        </button>
      </div>
    );
  }
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.payment_upi) setPaymentMethod('upi');
        else if (data.payment_card) setPaymentMethod('card');
        else if (data.payment_cod) setPaymentMethod('cod');
      });

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert('Please select a payment method');
    if (!formData.firstName || !formData.email || !formData.phone || !formData.address) {
      return alert('Please fill in all required shipping details');
    }

    setIsProcessing(true);

    if (paymentMethod === 'cod' || paymentMethod === 'upi') {
      const orderData = {
        userId: user?.id || null,
        items: cart,
        total,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'UPI_SCAN',
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        transactionId: (formData as any).transactionId || null
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        if (res.ok) {
          setStep(3);
          clearCart();
        }
      } catch (e) {
        console.error(e);
        alert('Failed to place order. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Razorpay Payment
      try {
        // 1. Create order on backend
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, receipt: `receipt_${Date.now()}` })
        });
        const razorpayOrder = await orderRes.json();

        // 2. Open Razorpay Checkout
        const options = {
          key: settings?.razorpay_key_id || 'rzp_test_placeholder', // Should be fetched from settings or env
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: settings?.site_name || "Ramshika",
          description: "Purchase from Ramshika",
          image: settings?.site_logo || "https://ui-avatars.com/api/?name=Ramshika&background=EAB308&color=fff&size=512",
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            // 3. Verify payment on backend
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: user?.id || null,
                items: cart,
                total,
                customerName: `${formData.firstName} ${formData.lastName}`,
                customerEmail: formData.email,
                customerPhone: formData.phone
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setStep(3);
              clearCart();
            } else {
              setStep(4); // Failure
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#EAB308" // brand-gold
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error(response.error);
          setStep(4);
        });
        rzp.open();
      } catch (error) {
        console.error("Razorpay Error:", error);
        alert('Payment initialization failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={64} />
        </div>
        <h1 className="text-4xl font-serif font-bold">Order Placed Successfully!</h1>
        <p className="text-slate-500">Thank you for shopping with {settings?.site_name || 'Ramshika'}. Your order confirmation has been sent to your email.</p>
        <div className="pt-8">
          <button onClick={() => onNavigate('home')} className="gold-button">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={64} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-red-600">Payment Failed</h1>
        <p className="text-slate-500">We couldn't process your payment. Please try again or choose a different payment method.</p>
        <div className="pt-8">
          <button onClick={() => setStep(1)} className="gold-button">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center space-x-2">
              <span className="w-8 h-8 bg-brand-gold text-white rounded-full flex items-center justify-center text-sm">1</span>
              <span>Shipping Address</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="First Name" className="col-span-1 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Last Name" className="col-span-1 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address" className="col-span-2 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="Phone Number" className="col-span-2 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Address" className="col-span-2 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="City" className="col-span-1 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
              <input name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" placeholder="Pincode" className="col-span-1 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none" />
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center space-x-2">
              <Lock className="text-brand-gold" size={24} />
              <span>Select Payment Method</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {settings?.payment_card && (
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all space-y-3 ${paymentMethod === 'card' ? 'border-brand-gold bg-brand-pink/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <CreditCard className={paymentMethod === 'card' ? 'text-brand-gold' : 'text-slate-400'} size={32} />
                  <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-slate-900' : 'text-slate-500'}`}>PayPal / Cards</span>
                </button>
              )}
              
              {settings?.payment_upi && (
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all space-y-3 ${paymentMethod === 'upi' ? 'border-brand-gold bg-brand-pink/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <QrCode className={paymentMethod === 'upi' ? 'text-brand-gold' : 'text-slate-400'} size={32} />
                  <span className={`text-sm font-bold ${paymentMethod === 'upi' ? 'text-slate-900' : 'text-slate-500'}`}>Google Pay / UPI</span>
                </button>
              )}

              {settings?.payment_cod && (
                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all space-y-3 ${paymentMethod === 'cod' ? 'border-brand-gold bg-brand-pink/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <Truck className={paymentMethod === 'cod' ? 'text-brand-gold' : 'text-slate-400'} size={32} />
                  <span className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-slate-900' : 'text-slate-500'}`}>Cash on Delivery</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {paymentMethod === 'upi' && settings?.upi_qr_code && (
                <motion.div 
                  key="upi-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 bg-white border-2 border-brand-gold rounded-[2rem] flex flex-col items-center space-y-6 shadow-sm"
                >
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Scan QR to Pay</h3>
                    <p className="text-sm text-slate-500">Scan this code with Google Pay, PhonePe, or any UPI App</p>
                  </div>
                  
                  <div className="relative p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <img src={settings.upi_qr_code} alt="UPI QR Code" className="w-64 h-64 object-contain rounded-xl" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-slate-100 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Smartphone size={10} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Secure UPI Payment</span>
                    </div>
                  </div>

                  {settings.upi_id && (
                    <div className="w-full text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your UPI ID</p>
                      <div className="bg-slate-50 rounded-xl py-3 px-6 inline-block">
                        <p className="text-brand-gold font-mono font-bold tracking-wider">{settings.upi_id}</p>
                      </div>
                    </div>
                  )}

                  <div className="w-full max-w-sm space-y-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Transaction ID / UTR Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter 12-digit UTR number"
                      className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-brand-gold outline-none text-center font-bold text-slate-700 transition-all"
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value } as any)}
                    />
                    <p className="text-[10px] text-slate-400 italic text-center">Please enter the transaction ID after successful payment for verification.</p>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'card' && (
                <motion.div 
                  key="card-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center justify-center space-y-4 text-center"
                >
                  <CreditCard size={48} className="text-brand-gold" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Secure Card Payment</h3>
                    <p className="text-sm text-slate-500">You will be redirected to our secure payment gateway to complete your transaction.</p>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'cod' && (
                <motion.div 
                  key="cod-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center justify-center space-y-4 text-center"
                >
                  <Truck size={48} className="text-brand-gold" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Cash on Delivery</h3>
                    <p className="text-sm text-slate-500">Pay with cash when your order is delivered to your doorstep.</p>
                  </div>
                </motion.div>
              )}

              {!settings?.payment_upi && !settings?.payment_card && !settings?.payment_cod && (
                <p className="text-red-500 font-bold">No payment methods available. Please contact support.</p>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <h3 className="text-2xl font-serif font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.name} x {item.quantity}</span>
                  <span className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-xl pt-4">
                <span className="font-serif font-bold">Total</span>
                <span className="font-bold text-brand-deep-pink">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full pink-button mt-8 py-4 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
