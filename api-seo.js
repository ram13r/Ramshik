const enhancements = {
  1: {
    titleSuffix: ' | Premium Silk Banarasi Saree',
    descKeywords: ' Perfect for weddings, festive occasions, and traditional Indian ceremonies. Woven with pure silk threads.'
  },
  2: {
    titleSuffix: ' | Artificial Kundan Bridal Jewellery',
    descKeywords: ' Handcrafted premium quality artificial jewellery. Ideal for bridal wear and party wear.'
  }
};

async function run() {
  console.log("Fetching products...");
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  let updated = 0;

  for (const p of products) {
    const props = enhancements[p.category_id] || { titleSuffix: ' | Indian Fashion', descKeywords: ' Premium quality craftsmanship.' };
    
    let newName = p.name;
    if (!newName.includes('|')) {
      newName = `${p.name}${props.titleSuffix}`;
    }

    let newDesc = p.description;
    if (!newDesc.includes(props.descKeywords.trim())) {
      newDesc = `${p.description}${props.descKeywords}`;
    }

    if (newName !== p.name || newDesc !== p.description) {
      console.log(`Updating ${p.name}...`);
      const updateRes = await fetch(`http://localhost:3000/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, name: newName, description: newDesc })
      });
      if(updateRes.ok) {
         updated++;
      } else {
         console.error(`Failed to update ${p.id}`);
      }
    }
  }
  console.log(`Successfully SEO-optimized ${updated} products via API!`);
}

run();
