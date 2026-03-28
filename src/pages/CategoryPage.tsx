import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

export default function CategoryPage({ category, searchQuery, onProductClick }: { category: string, searchQuery?: string, onProductClick: (id: number) => void }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    categories: [],
    minPrice: 0,
    maxPrice: 100000,
    inStock: true,
    outOfStock: true,
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setLoading(true);
    let url = category === 'All Products' || searchQuery ? '/api/products' : `/api/products?category=${category}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setLoading(false);
      });
  }, [category, searchQuery]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    // Apply Filters
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category_id));
    }

    result = result.filter(p => p.price <= filters.maxPrice);

    if (!filters.inStock) {
      result = result.filter(p => p.stock <= 0);
    }
    if (!filters.outOfStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Apply Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [allProducts, filters, sortBy]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 100000;
    return Math.max(...allProducts.map(p => p.price));
  }, [allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{category === 'Sarees' 
          ? 'Buy Banarasi Silk Sarees Online | Hand-Woven Bridal Sarees | Ramshika'
          : category === 'Artificial Jewellery'
          ? 'Buy Kundan Jewellery Online | Artificial Gold Necklaces & Sets | Ramshika'
          : `${category} | Buy Online India | Ramshika Collection`
        }</title>
        <meta name="description" content={
          category === 'Sarees'
            ? 'Shop authentic Banarasi silk sarees, Kanjeevaram, bridal sarees & cotton sarees online at Ramshika. Hand-woven premium sarees starting from ₹999. Free shipping above ₹2000.'
            : category === 'Artificial Jewellery'
            ? 'Buy Kundan jewellery sets, artificial necklaces, earrings, bangles & bridal jewellery online at Ramshika. Premium quality at affordable prices. Free shipping available.'
            : `Explore our exclusive collection of ${category}. Premium quality products at great prices at Ramshika. Shop now with free shipping above ₹2000.`
        } />
        <meta name="keywords" content={
          category === 'Sarees'
            ? 'banarasi silk saree buy online, bridal saree india, kanjeevaram silk saree, hand woven saree price, cotton saree online, wedding saree, salwar suit, ramshika saree'
            : category === 'Artificial Jewellery'
            ? 'kundan jewellery set online, artificial necklace india, bridal jewellery set, gold plated necklace, earrings online india, bangles online, temple jewellery'
            : `${category} online india, buy ${category} ramshika`
        } />
        <link rel="canonical" href={`https://www.ramshika.com/category-${encodeURIComponent(category)}`} />
      </Helmet>
      <div className="mb-12">
        <h1 className="text-5xl font-serif font-bold mb-2">{category}</h1>
        <p className="text-slate-500">Showing {filteredAndSortedProducts.length} products</p>
      </div>

      <ProductFilters 
        onFilterChange={setFilters} 
        onSortChange={setSortBy} 
        currentSort={sortBy}
        maxPriceLimit={maxPrice}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product.id)}
            />
          ))}
        </div>
      )}
      
      {!loading && filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100">
          <p className="text-slate-500 text-lg">No products match your current filters.</p>
          <button 
            onClick={() => setFilters({ categories: [], minPrice: 0, maxPrice: maxPrice, inStock: true, outOfStock: true })}
            className="mt-4 text-brand-deep-pink font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
