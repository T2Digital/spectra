import React, { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../../firebase/services';
import type { AuthUser } from '../../types';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const userList = await getUsers();
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = () => {
        // Creating users with email/password from a client-side admin panel is insecure.
        // This should be handled by a secure backend environment (e.g., Cloud Functions) using the Firebase Admin SDK.
        alert('لأسباب أمنية، تتم إضافة المستخدمين الجدد من خلال بيئة خلفية آمنة (Firebase Admin SDK) بدلاً من لوحة التحكم مباشرة.');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
                <button 
                    onClick={handleAddUser}
                    className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90"
                >
                    إضافة مستخدم جديد
                </button>
            </div>

            {loading ? <p>جاري تحميل المستخدمين...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2 bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-sm">الاسم</th>
                                <th className="py-3 px-4 font-semibold text-sm">البريد الإلكتروني</th>
                                <th className="py-3 px-4 font-semibold text-sm">تاريخ الانضمام</th>
                                <th className="py-3 px-4 font-semibold text-sm">معرّف المستخدم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.uid} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-sm">{user.displayName || 'غير متوفر'}</td>
                                    <td className="py-3 px-4 text-sm">{user.email}</td>
                                    <td className="py-3 px-4 text-sm">
                                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : 'غير محدد'}
                                    </td>
                                    <td className="py-3 px-4 text-xs font-mono text-gray-500">{user.uid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <p className="text-center py-10 text-gray-600">لا يوجد مستخدمون مسجلون حالياً.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;