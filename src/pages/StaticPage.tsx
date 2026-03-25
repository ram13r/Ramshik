import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function StaticPage({ title, content, children }: { title: string, content: string, children?: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Helmet>
        <title>{`${title} | Ramshika`}</title>
        <meta name="description" content={content.substring(0, 160)} />
      </Helmet>
      <h1 className="text-5xl font-serif font-bold mb-12 text-center text-brand-black">{title}</h1>
      <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
        {children ? children : content.split('\n').map((p, i) => (
          <p key={i} className="mb-6">{p}</p>
        ))}
      </div>
    </div>
  );
}
