import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, BookOpen, Share2, Copy, Check, ShoppingBag } from 'lucide-react';

const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, '') || '';

export default function BlogPage({ onNavigate, onProductClick }: { onNavigate: (page: string) => void; onProductClick?: (id: number) => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBlog, setActiveBlog] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlogs(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article from Ramshika: ${activeBlog?.title}`);
    if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  if (activeBlog) {
    const plainContent = stripHtml(activeBlog.content);
    const metaDesc = plainContent.substring(0, 160);
    const featuredProducts = products.slice(0, 4);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Helmet>
          <title>{`${activeBlog.title} | Ramshika Blog`}</title>
          <meta name="description" content={metaDesc} />
          <meta property="og:title" content={activeBlog.title} />
          <meta property="og:description" content={metaDesc} />
          {activeBlog.image_url && <meta property="og:image" content={activeBlog.image_url} />}
          <meta property="og:type" content="article" />
        </Helmet>

        <button
          onClick={() => setActiveBlog(null)}
          className="flex items-center space-x-2 text-brand-deep-pink mb-8 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Blog</span>
        </button>

        {activeBlog.image_url && (
          <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg">
            <img src={activeBlog.image_url} alt={activeBlog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{activeBlog.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center space-x-1"><User size={14} /><span>{activeBlog.author}</span></span>
            <span className="flex items-center space-x-1"><Calendar size={14} /><span>{new Date(activeBlog.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
          </div>
          {/* Share Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium flex items-center space-x-1"><Share2 size={12} /><span>Share:</span></span>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center space-x-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center space-x-1.5 bg-[#1877F2] text-white text-xs font-bold px-3 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>Facebook</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: activeBlog.content }}
        />

        {/* Shop the Look Section */}
        {featuredProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <div className="flex items-center space-x-3 mb-2">
              <ShoppingBag size={20} className="text-brand-deep-pink" />
              <h3 className="text-2xl font-serif font-bold">Shop the Look</h3>
            </div>
            <p className="text-slate-500 text-sm mb-8">Explore our handpicked collection featured in this article.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => onProductClick?.(product.id)}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="font-medium text-xs text-slate-800 line-clamp-2 leading-tight group-hover:text-brand-deep-pink transition-colors">{product.name}</p>
                    <p className="text-brand-deep-pink font-bold text-sm">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => onNavigate('category-all')}
                className="pink-button inline-flex items-center space-x-2"
              >
                <ShoppingBag size={18} />
                <span>View Full Collection</span>
              </button>
            </div>
          </div>
        )}

        {/* More Blogs */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <h3 className="text-xl font-serif font-bold mb-6">More from Our Blog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogs.filter(b => b.id !== activeBlog.id).slice(0, 4).map(blog => (
              <div
                key={blog.id}
                className="group cursor-pointer flex space-x-4"
                onClick={() => { setActiveBlog(blog); window.scrollTo(0, 0); }}
              >
                {blog.image_url && (
                  <img src={blog.image_url} alt={blog.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" referrerPolicy="no-referrer" />
                )}
                <div>
                  <p className="font-medium text-slate-800 group-hover:text-brand-deep-pink transition-colors line-clamp-2">{blog.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(blog.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Fashion Blog | Ramshika</title>
        <meta name="description" content="Style tips, saree care guides, jewellery trends and more from the Ramshika fashion experts." />
      </Helmet>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-3">Fashion &amp; Style Blog</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Saree draping guides, jewellery trends, style tips, and stories from our artisans.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <BookOpen size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-serif font-bold mb-2">No posts yet</h2>
          <p className="text-slate-500">Our team is working on something beautiful. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <article
              key={blog.id}
              className={`group cursor-pointer bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 ${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              onClick={() => { setActiveBlog(blog); window.scrollTo(0, 0); }}
            >
              {blog.image_url && (
                <div className={`overflow-hidden ${idx === 0 ? 'aspect-[16/7]' : 'aspect-video'}`}>
                  <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="p-6 space-y-3">
                <h2 className={`font-serif font-bold group-hover:text-brand-deep-pink transition-colors ${idx === 0 ? 'text-2xl' : 'text-lg'} leading-tight`}>{blog.title}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1"><User size={12} /><span>{blog.author}</span></span>
                  <span className="flex items-center space-x-1"><Calendar size={12} /><span>{new Date(blog.created_at).toLocaleDateString()}</span></span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{stripHtml(blog.content)}</p>
                <span className="inline-block text-sm font-bold text-brand-deep-pink group-hover:underline">Read More →</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
