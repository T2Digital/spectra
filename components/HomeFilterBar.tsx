import React, { useState } from 'react';
import { ChevronDown, X } from './icons';
import type { FilterOption } from '../types';

interface HomeFilterBarProps {
    options: FilterOption[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (filterId: string, option: string) => void;
    onClearFilters: () => void;
}

const HomeFilterBar: React.FC<HomeFilterBarProps> = ({ options, selectedFilters, onFilterChange, onClearFilters }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleToggleDropdown = (filterId: string) => {
        setOpenDropdown(prev => (prev === filterId ? null : filterId));
    };

    // FIX: Explicitly type `v` as `string[]` to resolve an issue where TypeScript
    // infers it as `unknown`, causing an error on `v.length`.
    const hasActiveFilters = Object.values(selectedFilters).some((v: string[]) => v.length > 0);

    return (
        <div className="bg-white border-y border-gray-200 py-4">
            <div className="container mx-auto px-4 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg hidden md:block">تصفية حسب:</span>
                {options.map(filter => (
                    <div key={filter.id} className="relative">
                        <button
                            onClick={() => handleToggleDropdown(filter.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full font-semibold text-sm hover:bg-gray-200"
                        >
                            <span>{filter.label}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === filter.id ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === filter.id && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-md border z-10 p-4">
                                <ul className="space-y-2 max-h-60 overflow-y-auto">
                                    {filter.options.map(option => (
                                        <li key={option}>
                                            <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                    checked={(selectedFilters[filter.id] || []).includes(option)}
                                                    onChange={() => onFilterChange(filter.id, option)}
                                                />
                                                <span className="text-sm text-gray-700 flex-grow">{option}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                {hasActiveFilters && (
                    <button 
                        onClick={onClearFilters} 
                        className="flex items-center gap-1.5 text-sm text-red-600 bg-red-100 px-3 py-1.5 rounded-full hover:bg-red-200"
                    >
                       <X className="w-4 h-4"/>
                       <span>مسح الكل</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default HomeFilterBar;