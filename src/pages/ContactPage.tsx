import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend
    console.log('Form submitted:', formState);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      <Helmet>
        <title>Contact Us | Ramshika Support</title>
        <meta name="description" content="Get in touch with Ramshika. Our support team is here to help you with your saree and jewellery orders, shipping, and more." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold mb-4"
          >
            Contact <span className="text-brand-deep-pink">Us</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-2xl mx-auto"
          >
            Have a question about our collection or need help with an order? Our team is here to provide you with the support you need.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-serif font-bold mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center text-brand-deep-pink flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Call Us</p>
                    <p className="text-slate-500 text-sm">+91 98765 43210</p>
                    <p className="text-xs text-slate-400 mt-1">Mon-Sat: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center text-brand-deep-pink flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Email Us</p>
                    <p className="text-slate-500 text-sm">support@ramshika.com</p>
                    <p className="text-xs text-slate-400 mt-1">We usually reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center text-brand-deep-pink flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Visit Us</p>
                    <p className="text-slate-500 text-sm">123, Fashion Street, Jaipur</p>
                    <p className="text-xs text-slate-400 mt-1">Rajasthan, India - 302001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-deep-pink p-8 rounded-3xl text-white">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare size={24} />
                <h3 className="text-xl font-serif font-bold">Live Chat</h3>
              </div>
              <p className="text-white/80 text-sm mb-6">
                Need immediate assistance? Our support agents are available for live chat during business hours.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-ramshika-chat'))}
                className="w-full bg-white text-brand-deep-pink py-3 rounded-full font-bold hover:bg-brand-gold hover:text-white transition-all"
              >
                Start Chatting
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 h-full">
              <h3 className="text-2xl font-serif font-bold mb-8">Send us a Message</h3>
              
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                    <Send size={40} />
                  </div>
                  <h4 className="text-2xl font-bold">Message Sent!</h4>
                  <p className="text-slate-500">Thank you for reaching out. We'll get back to you shortly.</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-brand-deep-pink font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formState.subject}
                      onChange={e => setFormState({...formState, subject: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Message</label>
                    <textarea 
                      rows={6}
                      required
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-brand-gold outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="pink-button w-full flex items-center justify-center space-x-2 py-4"
                  >
                    <Send size={20} />
                    <span>Send Message</span>
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
