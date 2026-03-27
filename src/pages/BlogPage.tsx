import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';

export default function BlogPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBlog, setActiveBlog] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (activeBlog) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Helmet>
          <title>{`${activeBlog.title} | Ramshika Blog`}</title>
          <meta name="description" content={activeBlog.content?.substring(0, 160)} />
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
        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
          <span className="flex items-center space-x-1"><User size={14} /><span>{activeBlog.author}</span></span>
          <span className="flex items-center space-x-1"><Calendar size={14} /><span>{new Date(activeBlog.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
        </div>

        <div
          className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {activeBlog.content}
        </div>

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
        <h1 className="text-4xl font-serif font-bold mb-3">Fashion & Style Blog</h1>
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
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <h2 className={`font-serif font-bold group-hover:text-brand-deep-pink transition-colors ${idx === 0 ? 'text-2xl' : 'text-lg'} leading-tight`}>{blog.title}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1"><User size={12} /><span>{blog.author}</span></span>
                  <span className="flex items-center space-x-1"><Calendar size={12} /><span>{new Date(blog.created_at).toLocaleDateString()}</span></span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{blog.content?.replace(/<[^>]*>/g, '')}</p>
                <span className="inline-block text-sm font-bold text-brand-deep-pink group-hover:underline">Read More →</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
