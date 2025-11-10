
import React, { useState, useEffect } from 'react';

const promos = [
  'شحن مجاني للطلبات فوق 1000 جنيه',
  'خصم 20% على أول طلب لك',
  'تشكيلة جديدة من النظارات الشمسية - تسوق الآن',
];

const PromoBar: React.FC = () => {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPromoIndex((prevIndex) => (prevIndex + 1) % promos.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-brand-primary text-white text-center py-2.5 px-4 text-sm font-medium">
      <p>{promos[currentPromoIndex]}</p>
    </div>
  );
};

export default PromoBar;
