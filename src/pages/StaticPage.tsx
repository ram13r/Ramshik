import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function StaticPage({ title, content }: { title: string, content: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Helmet>
        <title>{`${title} | Ramshika`}</title>
        <meta name="description" content={content.substring(0, 160)} />
      </Helmet>
      <h1 className="text-5xl font-serif font-bold mb-12 text-center">{title}</h1>
      <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
        {content.split('\n').map((p, i) => (
          <p key={i} className="mb-6">{p}</p>
        ))}
      </div>
    </div>
  );
}
