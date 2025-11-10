
import React from 'react';

interface PaymentOptionsProps {
  price: number;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ price }) => {
  return (
    <div className="mt-4 bg-brand-secondary p-4 rounded-lg flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-800">
          أو أقساط شهرية تبدأ من <span className="font-bold">{price.toLocaleString()} جنيه</span>
        </p>
        <p className="text-xs text-gray-500">بدون فوائد مع بطاقات ائتمانية محددة.</p>
      </div>
      <img src="https://paymob.com/images/Paymob-logo-En-PNG-01.png" alt="Paymob" className="h-6" />
    </div>
  );
};

export default PaymentOptions;
