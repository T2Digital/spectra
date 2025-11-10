import React, { useState, useEffect, useCallback } from 'react';
import { getShippingSettings, updateShippingSettings } from '../../firebase/services';
import type { ShippingSettings, ShippingCompany } from '../../types';
import { X, Plus, Trash2 } from '../../components/icons';

const egyptianGovernorates = [
    "القاهرة", "الجيزة", "الأسكندرية", "المنصورة", "أسوان", "أسيوط", "البحيرة", "بني سويف", "الدقهلية", "دمياط", "الفيوم",
    "الغربية", "الإسماعيلية", "كفر الشيخ", "الأقصر", "مطروح", "المنيا", "المنوفية", "الوادي الجديد", "شمال سيناء", "بورسعيد", "القليوبية",
    "قنا", "البحر الأحمر", "الشرقية", "سوهاج", "جنوب سيناء", "السويس"
].sort((a,b) => a.localeCompare(b, 'ar'));

const AdminShippingPage: React.FC = () => {
  const [settings, setSettings] = useState<ShippingSettings>({ companies: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const currentSettings = await getShippingSettings();
      if (currentSettings) {
        setSettings(currentSettings);
      }
    } catch (error) {
      console.error("Failed to fetch shipping settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) return;
    const newCompany: ShippingCompany = {
        id: Date.now().toString(),
        name: newCompanyName.trim(),
        prices: {}
    };
    setSettings(prev => ({ companies: [...prev.companies, newCompany] }));
    setNewCompanyName('');
  };

  const handleRemoveCompany = (companyId: string) => {
    if (window.confirm('هل أنت متأكد من حذف شركة الشحن هذه؟')) {
        setSettings(prev => ({
            companies: prev.companies.filter(c => c.id !== companyId)
        }));
    }
  };

  const handlePriceChange = (companyId: string, governorate: string, price: string) => {
    const priceValue = price === '' ? undefined : Number(price);
    setSettings(prev => ({
        ...prev,
        companies: prev.companies.map(c => {
            if (c.id === companyId) {
                const newPrices = { ...c.prices };
                if (priceValue === undefined) {
                    delete newPrices[governorate];
                } else {
                    newPrices[governorate] = priceValue;
                }
                return { ...c, prices: newPrices };
            }
            return c;
        })
    }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShippingSettings(settings);
      alert('تم حفظ إعدادات الشحن بنجاح!');
    } catch (error) {
      console.error("Failed to save shipping settings:", error);
      alert('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة إعدادات الشحن</h1>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-brand-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {loading ? (
        <p>جاري تحميل الإعدادات...</p>
      ) : (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-3">إضافة شركة شحن جديدة</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="اسم شركة الشحن"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button onClick={handleAddCompany} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"><Plus className="w-5 h-5"/></button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full min-w-max text-right">
                    <thead className="border-b-2">
                        <tr>
                            <th className="py-2 px-4 font-semibold sticky left-0 bg-white z-10">المحافظة</th>
                            {settings.companies.map(company => (
                                <th key={company.id} className="py-2 px-4 font-semibold text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {company.name}
                                        <button onClick={() => handleRemoveCompany(company.id)} title="حذف الشركة">
                                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700"/>
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {egyptianGovernorates.map(gov => (
                            <tr key={gov} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4 font-medium sticky left-0 bg-white hover:bg-gray-50 z-10">{gov}</td>
                                {settings.companies.map(company => (
                                    <td key={company.id} className="py-2 px-4">
                                        <input
                                            type="number"
                                            placeholder="--"
                                            value={company.prices[gov] ?? ''}
                                            onChange={(e) => handlePriceChange(company.id, gov, e.target.value)}
                                            className="w-24 text-center border border-gray-300 rounded-md p-1"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingPage;