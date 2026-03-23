import React, { useEffect, useState } from 'react';
import { Instagram, Play, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  caption?: string;
}

export default function InstagramFeed({ accessToken }: { accessToken?: string }) {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(false);

  // Placeholder videos for reference
  const placeholders: InstagramMedia[] = [
    {
      id: '1',
      media_type: 'VIDEO',
      media_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-34440-large.mp4',
      permalink: 'https://instagram.com',
      thumbnail_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      caption: 'Our latest Saree collection is here! ✨ #RamshikaCollection #SareeLove'
    },
    {
      id: '2',
      media_type: 'VIDEO',
      media_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-jewelry-and-smiling-34441-large.mp4',
      permalink: 'https://instagram.com',
      thumbnail_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
      caption: 'Elegance in every detail. Shop our new artificial jewellery. 💍'
    },
    {
      id: '3',
      media_type: 'VIDEO',
      media_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-with-a-traditional-dress-34442-large.mp4',
      permalink: 'https://instagram.com',
      thumbnail_url: 'https://images.unsplash.com/photo-1610030469668-935142b96fe4?auto=format&fit=crop&w=400&q=80',
      caption: 'Traditional vibes for the modern woman. 🌸 #EthnicWear'
    },
    {
      id: '4',
      media_type: 'VIDEO',
      media_url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-wearing-a-gold-necklace-34443-large.mp4',
      permalink: 'https://instagram.com',
      thumbnail_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80',
      caption: 'Golden glow. ✨ Explore our bridal collection.'
    }
  ];

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${accessToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            // Filter only videos or all media
            setMedia(data.data.slice(0, 4));
          } else {
            setMedia(placeholders);
          }
          setLoading(false);
        })
        .catch(() => {
          setMedia(placeholders);
          setLoading(false);
        });
    } else {
      setMedia(placeholders);
    }
  }, [accessToken]);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2 text-brand-deep-pink mb-2">
              <Instagram size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">@ramshika_collection</span>
            </div>
            <h2 className="text-4xl font-serif font-bold">Follow Us on Instagram</h2>
          </div>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors"
          >
            <span>Visit Profile</span>
            <ExternalLink size={18} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {media.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-100 shadow-lg"
            >
              {item.media_type === 'VIDEO' ? (
                <video 
                  src={item.media_url} 
                  poster={item.thumbnail_url}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                />
              ) : (
                <img 
                  src={item.media_url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                <div className="flex justify-end">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Instagram size={20} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {item.media_type === 'VIDEO' && (
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-deep-pink shadow-xl">
                      <Play size={24} fill="currentColor" />
                    </div>
                  )}
                  <p className="text-white text-sm line-clamp-3 font-medium leading-relaxed">
                    {item.caption}
                  </p>
                  <a 
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-white text-xs font-bold uppercase tracking-widest border-b border-white/40 pb-1 hover:border-white transition-colors"
                  >
                    View on Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
