import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

console.log("Starting SEO optimization for products...");

// Fetch all products
const products = db.prepare('SELECT id, name, description, category_id FROM products').all();

const keywordEnhancements: Record<number, { titleSuffix: string, descKeywords: string }> = {
  1: { // Sarees (assuming category 1 is Sarees based on seed)
    titleSuffix: ' | Premium Silk Banarasi Saree',
    descKeywords: ' Perfect for weddings, festive occasions, and traditional Indian ceremonies. Woven with pure silk threads.'
  },
  2: { // Jewellery
    titleSuffix: ' | Artificial Kundan Bridal Jewellery',
    descKeywords: ' Handcrafted premium quality artificial jewellery. Ideal for bridal wear and party wear.'
  }
};

let updated = 0;

for (const p of products as any[]) {
  const enhancements = keywordEnhancements[p.category_id] || { titleSuffix: ' | Indian Fashion', descKeywords: ' Premium quality craftsmanship.' };
  
  // Only append if not already appended
  let newName = p.name;
  if (!newName.includes('|')) {
    newName = `${p.name}${enhancements.titleSuffix}`;
  }

  let newDesc = p.description;
  if (!newDesc.includes(enhancements.descKeywords.trim())) {
    newDesc = `${p.description}${enhancements.descKeywords}`;
  }

  // Update product if changed
  if (newName !== p.name || newDesc !== p.description) {
    db.prepare('UPDATE products SET name = ?, description = ? WHERE id = ?').run(newName, newDesc, p.id);
    updated++;
  }
}

console.log(`Successfully SEO-optimized ${updated} products in the database!`);
