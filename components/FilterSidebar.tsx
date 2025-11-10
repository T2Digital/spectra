import React, { useState } from 'react';
import type { FilterOption } from '../types';
import { X, Search } from './icons';

interface FilterSidebarProps {
  options: FilterOption[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, option: string) => void;
  onClearFilters: () => void;
  filterCounts: Record<string, Record<string, number>>;
  isMobile?: boolean;
  onClose?: () => void;
  onApply?: () => void; // New prop for applying filters in mobile view
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
    options, selectedFilters, onFilterChange, onClearFilters, filterCounts, isMobile = false, onClose, onApply
}) => {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const handleSearchChange = (filterId: string, term: string) => {
    setSearchTerms(prev => ({...prev, [filterId]: term}));
  };
    
  return (
    <div className={` ${isMobile ? 'p-4 h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{isMobile ? 'تصفية المنتجات' : 'الفلاتر'}</h2>
            {isMobile ? (
                <button onClick={onClose} aria-label="Close filters"><X className="w-6 h-6"/></button>
            ) : (
                <button onClick={onClearFilters} className="text-sm font-semibold text-gray-600 hover:text-brand-primary">مسح الكل</button>
            )}
        </div>
      <div className={`${isMobile ? 'overflow-y-auto flex-grow' : ''}`}>
        {options.map(filter => {
          const searchTerm = searchTerms[filter.id] || '';
          const filteredOptions = filter.options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

          return (
          <div key={filter.id} className="py-6 border-b border-gray-200">
            <h3 className="font-semibold mb-3">{filter.label}</h3>
            {filter.options.length > 5 && (
              <div className="relative mb-3">
                  <Search className="w-4 h-4 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder={`ابحث عن ${filter.label}...`}
                    className="w-full border border-gray-300 rounded-md py-1.5 pr-8 pl-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(filter.id, e.target.value)}
                  />
              </div>
            )}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {filteredOptions.map(option => (
                <li key={option}>
                  <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      checked={(selectedFilters[filter.id] || []).includes(option)}
                      onChange={() => onFilterChange(filter.id, option)}
                    />
                    <span className="text-sm text-gray-700 flex-grow">{option}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{filterCounts[filter.id]?.[option] ?? 0}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )})}
      </div>
       {isMobile && (
          <div className="mt-auto pt-4 border-t space-y-2">
              <button onClick={onClearFilters} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold">مسح الكل</button>
              <button onClick={onApply || onClose} className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold">عرض النتائج</button>
          </div>
        )}
    </div>
  );
};

export default FilterSidebar;