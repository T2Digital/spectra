import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import QuickViewModal from '../components/QuickViewModal';
import type { Product, FilterOptionsData } from '../types';
import { Filter } from '../components/icons';
import { getProducts, getFilterOptions } from '../firebase/services';

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

// This page now acts as a destination for pre-filtered links (e.g., from the Header)
const CategoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productList, optionsData] = await Promise.all([
          getProducts(),
          getFilterOptions()
        ]);
        setProducts(productList);
        setFilterOptions(mapFilterOptions(optionsData));
      } catch (error) {
        console.error("Failed to fetch data:", error);
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
  
  const filterCounts = useMemo(() => {
    // This calculation remains the same
    const counts: Record<string, Record<string, number>> = {};
    filterOptions.forEach(filterGroup => {
      counts[filterGroup.id] = {};
      const baseFilters = { ...filters };
      delete baseFilters[filterGroup.id];
      const baseFilteredProducts = products.filter(product => {
        // FIX: Explicitly type the destructured 'values' as 'string[]' to resolve type inference issue.
        return Object.entries(baseFilters).every(([key, values]: [string, string[]]) => {
          if (!values.length) return true;
          const productValue = product[key as keyof Product];
          return values.includes(String(productValue));
        });
      });
      filterGroup.options.forEach((option: string) => {
        const count = baseFilteredProducts.filter(product => {
          const productValue = product[filterGroup.id as keyof Product];
          return String(productValue) === option;
        }).length;
        counts[filterGroup.id][option] = count;
      });
    });
    return counts;
  }, [filters, products, filterOptions]);

  const categoryTitle = searchParams.get('subCategory') || searchParams.get('category') || 'كل المنتجات';

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">{categoryTitle}</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row">
          <aside className="hidden sm:block w-full sm:w-1/4 xl:w-1/5 sm:pr-8">
            <FilterSidebar 
              options={filterOptions}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              filterCounts={filterCounts}
            />
          </aside>

          <div className="w-full sm:w-3/4 xl:w-4/5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">{loading ? 'جاري التحميل...' : `${filteredProducts.length} منتج`}</p>
              <button 
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md font-semibold"
                  onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="w-4 h-4" />
                <span>تصفية</span>
              </button>
            </div>
            {loading ? (
              <div className="text-center py-20">
                <p>جاري تحميل المنتجات...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">لا توجد منتجات تطابق بحثك.</p>
              </div>
            )}
          </div>
        </div>

        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFilterOpen(false)}></div>
        <div className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <FilterSidebar 
              options={filterOptions}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              filterCounts={filterCounts}
              isMobile={true}
              onClose={() => setIsFilterOpen(false)}
            />
        </div>
      </div>
      {quickViewProduct && (
          <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
};

export default CategoryPage;