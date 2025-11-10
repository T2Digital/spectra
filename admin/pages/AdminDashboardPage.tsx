import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { DollarSign, Package, Users, ShoppingCart as OrdersIcon } from '../../components/icons';
import { getDashboardStats } from '../../firebase/services';
import type { Order } from '../../types';

interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    lowStockCount: number;
    recentOrders: Order[];
}

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <p>جاري تحميل لوحة المعلومات...</p>;
    }
    
    if (!stats) {
        return <p>لم نتمكن من تحميل الإحصائيات.</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">ملخص الأداء</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    icon={DollarSign}
                    title="إجمالي المبيعات"
                    value={`${stats.totalSales.toLocaleString()} جنيه`}
                />
                <Link to="/admin/orders" className="block">
                    <StatCard 
                        icon={OrdersIcon}
                        title="إجمالي الطلبات"
                        value={stats.totalOrders.toString()}
                        className="transition-all hover:-translate-y-1 hover:shadow-xl"
                    />
                </Link>
                <Link to="/admin/users" className="block">
                    <StatCard 
                        icon={Users}
                        title="إجمالي العملاء"
                        value={stats.totalUsers.toString()}
                         className="transition-all hover:-translate-y-1 hover:shadow-xl"
                    />
                </Link>
                <Link to="/admin/products" className="block">
                    <StatCard 
                        icon={Package}
                        title="منتجات قريبة من النفاذ"
                        value={stats.lowStockCount.toString()}
                         className="transition-all hover:-translate-y-1 hover:shadow-xl"
                    />
                </Link>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">أحدث الطلبات</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2">
                            <tr>
                                <th className="py-2 px-4 whitespace-nowrap">رقم الطلب</th>
                                <th className="py-2 px-4 whitespace-nowrap">العميل</th>
                                <th className="py-2 px-4 whitespace-nowrap">الإجمالي</th>
                                <th className="py-2 px-4 whitespace-nowrap">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                           {stats.recentOrders.map(order => (
                             <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm font-medium">#{order.id.slice(0, 6)}</td>
                                <td className="py-3 px-4 text-sm">{order.customerDetails.name}</td>
                                <td className="py-3 px-4 text-sm">{order.total.toLocaleString()} جنيه</td>
                                <td className="py-3 px-4"><span className="bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{order.status}</span></td>
                            </tr>
                           ))}
                        </tbody>
                    </table>
                     {stats.recentOrders.length === 0 && (
                        <p className="text-center py-4 text-gray-500">لا توجد طلبات حديثة.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;