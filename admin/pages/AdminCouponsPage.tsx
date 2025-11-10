import React, { useState, useEffect, useCallback } from 'react';
import { getCoupons, deleteCoupon } from '../../firebase/services';
import type { Coupon } from '../../types';
import CouponFormModal from '../components/CouponFormModal';

const AdminCouponsPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const couponList = await getCoupons();
            setCoupons(couponList);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleAddNew = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (couponId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف كود الخصم هذا؟')) {
            try {
                await deleteCoupon(couponId);
                fetchCoupons();
            } catch (error) {
                console.error("Failed to delete coupon:", error);
                alert('حدث خطأ أثناء حذف الكود.');
            }
        }
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        fetchCoupons();
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">إدارة أكواد الخصم</h1>
                    <button onClick={handleAddNew} className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90">
                        إنشاء كود جديد
                    </button>
                </div>

                {loading ? <p>جاري تحميل الأكواد...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-sm">الكود</th>
                                    <th className="py-3 px-4 font-semibold text-sm">النوع</th>
                                    <th className="py-3 px-4 font-semibold text-sm">القيمة</th>
                                    <th className="py-3 px-4 font-semibold text-sm">تاريخ الانتهاء</th>
                                    <th className="py-3 px-4 font-semibold text-sm">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono text-sm">{coupon.code}</td>
                                        <td className="py-3 px-4 text-sm">{coupon.type === 'fixed' ? 'مبلغ ثابت' : 'نسبة مئوية'}</td>
                                        <td className="py-3 px-4 text-sm">{coupon.type === 'fixed' ? `${coupon.value} جنيه` : `${coupon.value}%`}</td>
                                        <td className="py-3 px-4 text-sm">{new Date(coupon.expiryDate.seconds * 1000).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-3 px-4 text-sm space-x-2 rtl:space-x-reverse">
                                            <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:underline">تعديل</button>
                                            <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:underline">حذف</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {coupons.length === 0 && !loading && (
                            <p className="text-center py-10 text-gray-600">لا توجد أكواد خصم حالياً.</p>
                        )}
                    </div>
                )}
            </div>
            {isModalOpen && <CouponFormModal coupon={editingCoupon} onClose={handleModalClose} onSuccess={handleFormSuccess} />}
        </>
    );
};

export default AdminCouponsPage;
