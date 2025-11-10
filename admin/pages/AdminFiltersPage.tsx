import React, { useState, useEffect, useCallback } from 'react';
import { getFilterOptions, updateFilterOptions } from '../../firebase/services';
import { seedFilters } from '../../firebase/seed';
import type { FilterOptionsData } from '../../types';
import { X, Plus } from '../../components/icons';

type FilterKey = keyof FilterOptionsData;

const AdminFiltersPage: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleAddItem = (key: FilterKey, value: string) => {
    if (!value || !filterOptions) return;
    const currentValues = filterOptions[key] || [];
    if (currentValues.includes(value)) return; // Avoid duplicates
    setFilterOptions({ ...filterOptions, [key]: [...currentValues, value] });
  };
  
  const handleRemoveItem = (key: FilterKey, value: string) => {
    if (!filterOptions) return;
    setFilterOptions({
      ...filterOptions,
      [key]: (filterOptions[key] || []).filter(item => item !== value),
    });
  };

  const handleSave = async () => {
    if (!filterOptions) return;
    setSaving(true);
    try {
      await updateFilterOptions(filterOptions);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (error) {
      console.error("Failed to save filter options:", error);
      alert('حدث خطأ أثناء حفظ التغييرات.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedFilters = async () => {
    await seedFilters();
    fetchOptions();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة خيارات الفلاتر</h1>
        <div>
          {filterOptions === null && !loading && (
            <button
              onClick={handleSeedFilters}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 mr-2"
            >
              تعبئة الفلاتر المبدئية
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading || !filterOptions}
            className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>جاري تحميل الإعدادات...</p>
      ) : filterOptions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FilterCard title="الماركات" filterKey="brands" options={filterOptions} onAdd={handleAddItem} onRemove={handleRemoveItem} />
          <FilterCard title="الفئات الفرعية" filterKey="subCategories" options={filterOptions} onAdd={handleAddItem} onRemove={handleRemoveItem} />
          <FilterCard title="الأشكال" filterKey="shapes" options={filterOptions} onAdd={handleAddItem} onRemove={handleRemoveItem} />
          <FilterCard title="الألوان" filterKey="colors" options={filterOptions} onAdd={handleAddItem} onRemove={handleRemoveItem} />
          <FilterCard title="الجنس" filterKey="genders" options={filterOptions} onAdd={handleAddItem} onRemove={handleRemoveItem} />
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600">لم يتم العثور على إعدادات الفلاتر.</p>
            <p className="text-gray-500 text-sm mt-2">اضغط على الزر أدناه لإضافة البيانات المبدئية.</p>
        </div>
      )}
    </div>
  );
};

interface FilterCardProps {
    title: string;
    filterKey: FilterKey;
    options: FilterOptionsData;
    onAdd: (key: FilterKey, value: string) => void;
    onRemove: (key: FilterKey, value: string) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({ title, filterKey, options, onAdd, onRemove }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddClick = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(filterKey, newItem.trim());
        setNewItem('');
    };
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">{title}</h2>
            <form onSubmit={handleAddClick} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`إضافة ${title.slice(0,-1)} جديد`}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button type="submit" className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"><Plus className="w-5 h-5"/></button>
            </form>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                {(options[filterKey] || []).map(item => (
                    <span key={item} className="bg-gray-100 text-gray-800 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full flex items-center gap-1.5">
                        {item}
                        <button onClick={() => onRemove(filterKey, item)} className="bg-gray-300 hover:bg-red-400 hover:text-white rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3"/>
                        </button>
                    </span>
                ))}
                 {(options[filterKey] || []).length === 0 && (
                     <p className="text-xs text-gray-400 p-2">لا توجد عناصر.</p>
                 )}
            </div>
        </div>
    );
};


export default AdminFiltersPage;