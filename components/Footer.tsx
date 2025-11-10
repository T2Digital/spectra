import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">SPECTRA</h3>
            <p className="text-sm text-gray-600">تجربة رؤية فريدة.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">تسوق</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/products?category=نظارات&subCategory=نظارات شمسية" className="hover:text-brand-accent">نظارات شمسية</Link></li>
              <li><Link to="/products?category=نظارات&subCategory=نظارات طبية" className="hover:text-brand-accent">نظارات طبية</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-accent">قائمة الرغبات</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">مساعدة</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/contact" className="hover:text-brand-accent">اتصل بنا</Link></li>
              <li><Link to="/faq" className="hover:text-brand-accent">الأسئلة الشائعة</Link></li>
              <li><Link to="/return-policy" className="hover:text-brand-accent">سياسة الإرجاع</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">تابعنا</h3>
            {/* Social media icons would go here */}
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-12 border-t border-gray-300 pt-6">
          <p>&copy; {new Date().getFullYear()} Spectra. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;