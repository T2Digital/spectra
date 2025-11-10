import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getOrdersByUserId } from '../firebase/services';
import type { Order, OrderStatus } from '../types';
import { User, PackageCheck } from '../components/icons';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'جديد': return 'bg-blue-100 text-blue-800';
    case 'قيد التنفيذ': return 'bg-yellow-100 text-yellow-800';
    case 'تم الشحن': return 'bg-purple-100 text-purple-800';
    case 'مكتمل': return 'bg-green-100 text-green-800';
    case 'ملغي': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setLoadingOrders(true);
        try {
          const userOrders = await getOrdersByUserId(user.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error("Failed to fetch user orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
  }, [user]);

  if (authLoading || !user) {
    return <div className="text-center py-20">جاري التحميل...</div>;
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-center mb-8">حسابي</h1>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{user.displayName}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </div>
             <p className="text-xs text-gray-500 mt-4">
                تاريخ الانضمام: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : 'غير محدد'}
            </p>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">سجل الطلبات</h2>
            {loadingOrders ? (
              <p>جاري تحميل طلباتك...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                           <p className="font-bold">طلب رقم #{order.id.slice(0, 8)}</p>
                           <p className="text-xs text-gray-500">{new Date(order.createdAt.seconds * 1000).toLocaleString('ar-EG')}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {order.items.map(item => <p key={item.id}>- {item.name} (x{item.quantity})</p>)}
                    </div>
                    <p className="text-right font-bold mt-2">{order.total.toLocaleString()} جنيه</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <PackageCheck className="w-12 h-12 text-gray-300 mx-auto mb-2"/>
                <p className="text-gray-600">لم تقم بأي طلبات بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;