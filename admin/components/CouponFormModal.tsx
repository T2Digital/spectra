import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Coupon } from '../../types';
import { addCoupon, updateCoupon } from '../../firebase/services';
import { X } from '../../components/icons';

interface CouponFormModalProps {
    coupon: Coupon | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({ coupon, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState(0);
    const [expiryDate, setExpiryDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (coupon) {
            setCode(coupon.code);
            setType(coupon.type);
            setValue(coupon.value);
            const date = new Date(coupon.expiryDate.seconds * 1000).toISOString().split('T')[0];
            setExpiryDate(date);
        }
    }, [coupon]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const couponData = {
                code: code.toUpperCase(),
                type,
                value: Number(value),
                expiryDate: Timestamp.fromDate(new Date(expiryDate)),
            };

            if (coupon) {
                await updateCoupon(coupon.id, couponData);
            } else {
                await addCoupon(couponData);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(`حدث خطأ أثناء حفظ الكود: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-lg w-full">
               <div className="p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{coupon ? 'تعديل كود الخصم' : 'إنشاء كود خصم جديد'}</h2>
                    <button onClick={onClose}><X/></button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="كود الخصم" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required/>
                    <div className="grid grid-cols-2 gap-4">
                       <SelectField label="النوع" value={type} onChange={(e) => setType(e.target.value as any)} options={[{value:'percentage', label:'نسبة مئوية'}, {value:'fixed', label:'مبلغ ثابت'}]} />
                       <InputField label="القيمة" type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} required/>
                    </div>
                     <InputField label="تاريخ الانتهاء" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required/>
                     
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg font-semibold">إلغاء</button>
                        <button type="submit" disabled={loading} className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold disabled:bg-gray-400">
                            {loading ? 'جاري الحفظ...' : 'حفظ الكود'}
                        </button>
                    </div>
                 </form>
               </div>
            </div>
        </div>
    );
};

const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
    </div>
);

const SelectField: React.FC<any> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default CouponFormModal;
