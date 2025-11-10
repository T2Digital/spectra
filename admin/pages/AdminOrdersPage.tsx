import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../../firebase/services';
import type { Order, OrderStatus } from '../../types';
import { PackageCheck } from '../../components/icons';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'جديد':
      return 'bg-blue-200 text-blue-800';
    case 'قيد التنفيذ':
      return 'bg-yellow-200 text-yellow-800';
    case 'تم الشحن':
      return 'bg-purple-200 text-purple-800';
    case 'مكتمل':
      return 'bg-green-200 text-green-800';
    case 'ملغي':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const orderList = await getOrders();
      setOrders(orderList);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    const originalOrders = [...orders];
    setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        )
    );
    try {
        await updateOrderStatus(orderId, newStatus);
        // On success, the optimistic update is confirmed.
    } catch (error) {
        console.error("Failed to update order status:", error);
        alert('حدث خطأ أثناء تحديث حالة الطلب. سيتم استعادة الحالة الأصلية.');
        // Revert UI on failure
        setOrders(originalOrders);
    }
  };
  
  const handleCreateShippingLabel = (orderId: string) => {
      alert(`سيتم هنا ربط API شركة الشحن لإنشاء بوليصة للطلب رقم: ${orderId}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة الطلبات</h1>
      
      {loading ? (
        <p>جاري تحميل الطلبات...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b-2 bg-gray-50">
              <tr>
                <th className="py-3 px-4 font-semibold text-sm">رقم الطلب</th>
                <th className="py-3 px-4 font-semibold text-sm">العميل</th>
                <th className="py-3 px-4 font-semibold text-sm">التاريخ</th>
                <th className="py-3 px-4 font-semibold text-sm">الإجمالي</th>
                <th className="py-3 px-4 font-semibold text-sm">الحالة</th>
                <th className="py-3 px-4 font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-sm">#{order.id.slice(0, 6)}...</td>
                  <td className="py-3 px-4 text-sm">{order.customerDetails.name}</td>
                  <td className="py-3 px-4 text-sm">{new Date(order.createdAt.seconds * 1000).toLocaleDateString('ar-EG')}</td>
                  <td className="py-3 px-4 text-sm">{order.total.toLocaleString()} جنيه</td>
                  <td className="py-3 px-4">
                    <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-none appearance-none ${getStatusColor(order.status)}`}
                    >
                        <option value="جديد">جديد</option>
                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                        <option value="تم الشحن">تم الشحن</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="ملغي">ملغي</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                        onClick={() => handleCreateShippingLabel(order.id)}
                        className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md"
                        title="إنشاء بوليصة شحن"
                    >
                        <PackageCheck className="w-3 h-3" />
                        <span>شحن</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-gray-600">لا توجد طلبات حتى الآن.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;