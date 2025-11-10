import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../firebase/services';
import type { Product } from '../types';
import { X, Search } from './icons';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAllProducts = async () => {
        setLoading(true);
        try {
          const products = await getProducts();
          setAllProducts(products);
        } catch (error) {
          console.error("Failed to fetch products for search:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, allProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-4 md:p-8" role="dialog" aria-modal="true">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ابحث في متجرنا</h2>
        <button onClick={onClose}><X className="w-8 h-8" /></button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ما الذي تبحث عنه؟"
          className="w-full text-xl p-4 pr-14 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
          autoFocus
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading && searchTerm.length > 1 && <p>جاري البحث...</p>}
        {!loading && searchTerm.length > 1 && filteredProducts.length === 0 && <p>لا توجد نتائج بحث لـ "{searchTerm}"</p>}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} className="flex items-start gap-4 p-4 hover:bg-gray-100 rounded-lg">
                <img src={product.images[0]} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <p className="mt-2 font-bold">{product.price.toLocaleString()} جنيه</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
