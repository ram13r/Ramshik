import Database from 'better-sqlite3';

const db = new Database('ramshika.db');

db.prepare('DELETE FROM blogs').run();

const insertBlog = db.prepare('INSERT INTO blogs (title, slug, content, image_url, author, is_published) VALUES (?, ?, ?, ?, ?, ?)');

insertBlog.run(
  'The Ultimate Guide to Draping a Silk Saree',
  'ultimate-guide-draping-silk-saree',
  '<h2>Why Silk Sarees?</h2><p>Silk sarees like Banarasi or Kanjeevaram are the epitome of Indian elegance. Their rich texture and intricate zari work make them a must-have for weddings and festive occasions.</p><h2>Step-by-Step Draping</h2><p>1. <strong>Tuck the Fabric:</strong> Start by tucking the plain end of the saree into your petticoat, completing one full round.<br>2. <strong>Make Pleats:</strong> Make 5 to 7 neat pleats and tuck them slightly left of your navel.<br>3. <strong>The Pallu:</strong> Bring the remaining fabric around your back and drape the pallu over your left shoulder, pinning it securely.</p><h3>Styling Tips</h3><p>To enhance the luxurious look of a silk saree, pair it with authentic artificial temple jewellery or heavy Kundan necklaces. Keep the makeup elegant to balance the outfit\\'s heavy look. Check out our latest collection of Indian sarees to find your perfect match!</p>',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'Ramshika Team',
  1
);

insertBlog.run(
  'How to Match Artificial Jewellery with Your Outfit',
  'match-artificial-jewellery-outfit',
  '<h2>The Art of Matching Jewellery</h2><p>Jewellery can instantly elevate any traditional look, but achieving the right balance is essential. When exploring artificial jewellery, you have endless aesthetic options.</p><h2>When to Wear Kundan Sets</h2><p><strong>Kundan sets</strong> add a regal and majestic flair to heavy sarees and lehengas. Their intricate glass-polki design catches the light beautifully, making them ideal for night-time receptions or major festivals. Always pair heavy kundan chokers with deep-neck blouses.</p><h2>The Magic of Statement Earrings</h2><p>If your saree features a heavy embroidered border or high neckline, skip the heavy necklace entirely! Instead, wear large statement <em>Jhumkas</em> or <em>Chandbalis</em>. This draws attention to your face without clashing with the dress.</p><h2>Mixing Metals</h2><p>Don\\'t be afraid to mix gold and silver tones! Dual-toned artificial jewellery is incredibly trendy right now and allows you to reuse pieces across differently colored outfits. Explore Ramshika\\'s curated jewellery collection today.</p>',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  'Ramshika Stylists',
  1
);

console.log('Successfully seeded fully formatted SEO blogs!');
