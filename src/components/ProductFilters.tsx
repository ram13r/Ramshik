import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Category } from '../types';

interface FilterState {
  categories: number[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  outOfStock: boolean;
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  maxPriceLimit: number;
}

export default function ProductFilters({ onFilterChange, onSortChange, currentSort, maxPriceLimit }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: maxPriceLimit,
    inStock: true,
    outOfStock: true,
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.filter((c: Category) => c.parent_id !== null)));
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const toggleCategory = (id: number) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }));
  };

  const sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Alphabetical: A-Z', value: 'name_asc' },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 border border-slate-200 px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors bg-white shadow-sm"
        >
          <div className="w-5 h-5 bg-brand-gold/10 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
          </div>
          <span className="font-medium text-sm">Filters</span>
          {filters.categories.length > 0 && (
            <span className="bg-brand-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {filters.categories.length}
            </span>
          )}
        </button>

        <div className="relative group">
          <button className="flex items-center space-x-2 border border-slate-200 px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors bg-white shadow-sm min-w-[180px] justify-between">
            <span className="font-medium text-sm">
              {sortOptions.find(o => o.value === currentSort)?.label || 'Sort By'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`w-full text-left px-5 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between ${currentSort === option.value ? 'text-brand-deep-pink font-bold' : 'text-slate-600'}`}
              >
                {option.label}
                {currentSort === option.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Sidebar/Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Category</h3>
                <div className="grid grid-cols-1 gap-4">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
                      <div 
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${filters.categories.includes(cat.id) ? 'bg-brand-gold border-brand-gold' : 'border-slate-200 group-hover:border-brand-gold'}`}
                      >
                        {filters.categories.includes(cat.id) && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${filters.categories.includes(cat.id) ? 'text-brand-deep-pink' : 'text-slate-600'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Price Range</h3>
                <div className="space-y-6">
                  <div className="flex justify-between text-sm font-bold">
                    <span>₹0</span>
                    <span className="text-brand-deep-pink">₹{filters.maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPriceLimit} 
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Min Price</p>
                      <p className="font-bold">₹0</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Max Price</p>
                      <p className="font-bold">₹{filters.maxPrice}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Availability</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="font-bold text-sm">In Stock</span>
                    <input 
                      type="checkbox" 
                      checked={filters.inStock}
                      onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                      className="w-5 h-5 accent-brand-gold"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="font-bold text-sm">Out of Stock</span>
                    <input 
                      type="checkbox" 
                      checked={filters.outOfStock}
                      onChange={(e) => setFilters({...filters, outOfStock: e.target.checked})}
                      className="w-5 h-5 accent-brand-gold"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFilters({
                  categories: [],
                  minPrice: 0,
                  maxPrice: maxPriceLimit,
                  inStock: true,
                  outOfStock: true,
                })}
                className="py-4 border border-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Reset All
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="pink-button py-4 rounded-full font-bold text-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
