import React, { useState, useEffect } from 'react';
import type { Product, FilterOptionsData } from '../../types';
import { addProduct, updateProduct, getFilterOptions, uploadImage } from '../../firebase/services';
import { X } from '../../components/icons';

interface ProductFormModalProps {
    product: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyProduct: Omit<Product, 'id'> = {
    name: '',
    brand: '',
    price: 0,
    originalPrice: 0,
    images: [''],
    category: 'نظارات',
    subCategory: '',
    gender: 'رجالي',
    shape: '',
    color: '',
    sizes: [''],
    stock: 0,
    installmentStartPrice: 0,
    reviews: [],
};


const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterOptions, setFilterOptions] = useState<FilterOptionsData | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            const options = await getFilterOptions();
            setFilterOptions(options);
            if (product) {
                setFormData({ ...product });
            } else {
                setFormData(prev => ({
                    ...prev,
                    brand: options?.brands[0] || '',
                    subCategory: options?.subCategories[0] || '',
                    gender: (options?.genders[0] as Product['gender']) || 'رجالي',
                    shape: options?.shapes[0] || '',
                }));
            }
        };
        fetchOptions();
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'originalPrice' || name === 'installmentStartPrice' || name === 'stock') ? Number(value) : value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'sizes') => {
        const value = e.target.value.split(',').map(item => item.trim());
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setIsUploading(true);
        setError('');
        try {
            // FIX: Explicitly type 'file' as 'File' to resolve type inference issue with 'FileList'.
            const uploadedUrls = await Promise.all(
                Array.from(e.target.files).map((file: File) => uploadImage(file))
            );
            setFormData(prev => {
                const existingImages = prev.images.filter(img => img.trim() !== '');
                return { ...prev, images: [...existingImages, ...uploadedUrls] };
            });
        } catch (err) {
            console.error(err);
            setError('فشل رفع الصور. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsUploading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.brand || !formData.subCategory) {
            setError("يرجى تحديد ماركة وفئة فرعية.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (product) {
                await updateProduct(product.id, formData);
            } else {
                await addProduct(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(`حدث خطأ أثناء حفظ المنتج: ${err.message}. تحقق من قواعد الأمان في Firestore.`);
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
               <div className="p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                    <button onClick={onClose}><X/></button>
                 </div>
                 {!filterOptions ? <p>جاري تحميل خيارات الفلتر...</p> : (
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="اسم المنتج" name="name" value={formData.name} onChange={handleChange} required/>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="السعر" name="price" type="number" value={formData.price} onChange={handleChange} required/>
                        <InputField label="المخزون" name="stock" type="number" value={formData.stock} onChange={handleChange} required/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <InputField label="السعر الأصلي (اختياري)" name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} />
                        <InputField label="يبدأ القسط من" name="installmentStartPrice" type="number" value={formData.installmentStartPrice} onChange={handleChange} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <SelectField label="الماركة" name="brand" value={formData.brand} onChange={handleChange} options={filterOptions.brands} required />
                       <SelectField label="الجنس" name="gender" value={formData.gender} onChange={handleChange} options={filterOptions.genders} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <SelectField label="الفئة الرئيسية" name="category" value={formData.category} onChange={handleChange} options={['نظارات', 'عدسات لاصقة', 'اكسسوارات']} />
                        <SelectField label="الفئة الفرعية" name="subCategory" value={formData.subCategory} onChange={handleChange} options={filterOptions.subCategories} required />
                        <SelectField label="الشكل" name="shape" value={formData.shape} onChange={handleChange} options={filterOptions.shapes} />
                     </div>
                    <InputField label="اللون" name="color" value={formData.color} onChange={handleChange} />
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الصور</label>
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="أو أدخل روابط مفصولة بفاصلة" className="w-full px-3 py-2 border rounded-md" value={formData.images.join(', ')} onChange={e => handleArrayChange(e, 'images')} />
                             <label className="cursor-pointer bg-gray-200 py-2 px-4 rounded-lg font-semibold whitespace-nowrap">
                                {isUploading ? 'جاري الرفع...' : 'رفع صور'}
                                <input type="file" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading}/>
                             </label>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المقاسات (مفصولة بفاصلة)</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-md" value={formData.sizes.join(', ')} onChange={e => handleArrayChange(e, 'sizes')} />
                     </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg font-semibold">إلغاء</button>
                        <button type="submit" disabled={loading || isUploading} className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold disabled:bg-gray-400">
                            {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
                        </button>
                    </div>
                 </form>
                 )}
               </div>
            </div>
        </div>
    );
};


const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"/>
    </div>
);

const SelectField: React.FC<any> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default ProductFormModal;