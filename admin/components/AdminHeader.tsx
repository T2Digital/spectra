import React from 'react';
import { Search, Bell } from '../../components/icons';

const AdminHeader: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        {/* TODO: This could be dynamically set based on the route */}
        <h1 className="text-xl font-bold text-gray-800">لوحة المعلومات</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2 rtl:left-auto rtl:right-3" />
          <input 
            type="text" 
            placeholder="بحث..." 
            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 rtl:pl-4 rtl:pr-10 focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <button className="relative text-gray-500 hover:text-gray-800">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <img src="https://picsum.photos/id/237/100/100" alt="Admin avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
