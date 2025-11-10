import React from 'react';
import { ShieldCheck } from './icons';

const TrustBadge: React.FC = () => {
  return (
    <div className="fixed top-28 left-5 z-30 bg-white shadow-xl rounded-full p-2 flex items-center space-x-2 rtl:space-x-reverse">
        <div className="bg-teal-100 rounded-full p-2">
           <ShieldCheck className="h-5 w-5 text-teal-600" />
        </div>
        <p className="text-sm font-semibold text-gray-700 pr-2">متعاقدون مع شركات التأمين الكبرى</p>
    </div>
  );
};

export default TrustBadge;