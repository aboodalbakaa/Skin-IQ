"use client";

import { useState } from 'react';
import CategoryFilter from './CategoryLuxe';
import ProductShowcase from './ProductShowcase';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  discount_retail_price?: number | null;
  discount_wholesale_price?: number | null;
  image_url: string;
  badge?: string;
  is_wholesale?: boolean;
  is_out_of_stock?: boolean;
  category?: string;
}

interface FilterableShowcaseProps {
  products: Product[];
  categories: string[];
}

export default function FilterableShowcase({ products, categories }: FilterableShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <>
      <CategoryFilter categories={categories} onFilter={setActiveCategory} />
      <ProductShowcase products={filtered} />
    </>
  );
}
