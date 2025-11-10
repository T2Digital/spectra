import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart as OrdersIcon, Users, LogOut, Settings, Ticket, Bell, DollarSign } from '../../components/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة المعلومات' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/filters', icon: Settings, label: 'إعدادات الفلاتر' },
  { to: '/admin/orders', icon: OrdersIcon, label: 'الطلبات' },
  { to: '/admin/coupons', icon: Ticket, label: 'أكواد الخصم' },
  { to: '/admin/shipping', icon: DollarSign, label: 'إعدادات الشحن' },
  { to: '/admin/users', icon: Users, label: 'المستخدمون' },
  { to: '/admin/notifications', icon: Bell, label: 'الإشعارات' },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      alert('حدث خطأ أثناء تسجيل الخروج.');
    }
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-brand-primary font-bold'
        : 'hover:bg-gray-700'
    }`;

  return (
    <aside className="w-64 bg-brand-primary text-white flex-col shrink-0 hidden md:flex">
      <div className="h-20 flex items-center justify-center border-b border-gray-700">
        <Link to="/admin" className="text-2xl font-extrabold tracking-wider text-white">
          SPECTRA
          <span className="text-sm font-normal text-brand-accent ml-1">Admin</span>
        </Link>
      </div>
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={getNavLinkClass}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-80 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;