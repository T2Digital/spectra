import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFilterOptions } from '../firebase/services';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import AIStylist from '../components/AIStylist';
import VTOHero from '../components/VTOHero';
import HomeFilterBar from '../components/HomeFilterBar';
import type { Product, FilterOptionsData } from '../types';

const mapFilterOptions = (optionsData: FilterOptionsData | null): any[] => {
  if (!optionsData) return [];
  return [
    { id: 'gender', label: 'الجنس', options: optionsData.genders || [] },
    { id: 'brand', label: 'البراند', options: optionsData.brands || [] },
    { id: 'subCategory', label: 'النوع', options: optionsData.subCategories || [] },
    { id: 'shape', label: 'الشكل', options: optionsData.shapes || [] },
    { id: 'color', label: 'اللون', options: optionsData.colors || [] },
  ];
};

const HomePage: React.FC<{ allProducts: Product[] }> = ({ allProducts }) => {
    const [products] = useState<Product[]>(allProducts);
    const [loading, setLoading] = useState(true);
    const [filterOptions, setFilterOptions] = useState<any[]>([]);
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const optionsData = await getFilterOptions();
          setFilterOptions(mapFilterOptions(optionsData));
        } catch (error) {
          console.error("Failed to fetch filter options:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    useEffect(() => {
      const params = new URLSearchParams(searchParams);
      const initialFilters: Record<string, string[]> = {};
      params.forEach((value, key) => {
        initialFilters[key] = value.split(',');
      });
      setFilters(initialFilters);
    }, [searchParams]);

    const handleFilterChange = (filterId: string, option: string) => {
      setFilters(prevFilters => {
        const currentOptions = prevFilters[filterId] || [];
        const newOptions = currentOptions.includes(option)
          ? currentOptions.filter(o => o !== option)
          : [...currentOptions, option];
        
        const newParams = new URLSearchParams(searchParams);
        if (newOptions.length === 0) {
          newParams.delete(filterId);
        } else {
          newParams.set(filterId, newOptions.join(','));
        }
        setSearchParams(newParams);
        return { ...prevFilters, [filterId]: newOptions };
      });
    };

    const clearFilters = () => {
      setFilters({});
      setSearchParams({});
    };

    const filteredProducts = useMemo(() => {
      if (Object.keys(filters).length === 0) return products;
      return products.filter(product => {
        // FIX: Explicitly type the destructured 'values' as 'string[]' to resolve type inference issue.
        return Object.entries(filters).every(([key, values]: [string, string[]]) => {
          if (!values.length) return true;
          const productValue = product[key as keyof Product];
          return values.includes(String(productValue));
        });
      });
    }, [filters, products]);

    const glassesProducts = useMemo(() => {
        return allProducts.filter(p => p.category === 'نظارات').slice(0, 10);
    }, [allProducts]);
    
    return (
        <>
            <VTOHero products={glassesProducts} />
            <div className="container mx-auto px-4 py-8">
                <HomeFilterBar 
                    options={filterOptions}
                    selectedFilters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                />
                
                <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">كل المنتجات</h2>
                        <p className="text-sm text-gray-600">{loading ? 'جاري التحميل...' : `${filteredProducts.length} منتج`}</p>
                     </div>
                     {loading && products.length === 0 ? (
                        <div className="text-center py-20"><p>جاري تحميل المنتجات...</p></div>
                     ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct}/>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-20"><p className="text-xl text-gray-600">لا توجد منتجات تطابق بحثك.</p></div>
                     )}
                </div>
                 <div className="my-16">
                    <AIStylist allProducts={allProducts} />
                </div>
            </div>
            {quickViewProduct && (
                <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
            )}
        </>
    );
};

export default HomePage;
