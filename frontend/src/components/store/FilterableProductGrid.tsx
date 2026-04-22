"use client";

import { useState } from 'react';
import CategoryFilter from './CategoryLuxe';
import ProductGrid from './ProductGrid';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  is_wholesale?: boolean;
  is_out_of_stock?: boolean;
  badge?: string;
  category?: string;
}

interface FilterableProductGridProps {
  products: Product[];
  categories: string[];
}

export default function FilterableProductGrid({ products, categories }: FilterableProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <>
      <div className="mb-6">
        <CategoryFilter categories={categories} onFilter={setActiveCategory} />
      </div>
      <ProductGrid products={filtered} />
    </>
  );
}
