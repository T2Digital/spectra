import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { createOrder, getCouponByCode, signUpUser, signInUser, getShippingSettings } from '../firebase/services';
import type { Order, Coupon, AuthUser, ShippingSettings, ShippingCompany } from '../types';
import { Share, CreditCard, ArrowLeft } from '../components/icons';

const egyptianGovernorates = [
    "القاهرة", "الجيزة", "الأسكندرية", "المنصورة",
    "أسوان", "أسيوط", "البحيرة", "بني سويف", "الدقهلية", "دمياط", "الفيوم",
    "الغربية", "الإسماعيلية", "كفر الشيخ", "الأقصر", "مطروح", "المنيا",
    "المنوفية", "الوادي الجديد", "شمال سيناء", "بورسعيد", "القليوبية",
    "قنا", "البحر الأحمر", "الشرقية", "سوهاج", "جنوب سيناء", "السويس"
].sort((a, b) => {
    const pinned = ["القاهرة", "الجيزة", "الأسكندرية", "المنصورة"];
    const isAPinned = pinned.includes(a);
    const isBPinned = pinned.includes(b);
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;
    if (isAPinned && isBPinned) return pinned.indexOf(a) - pinned.indexOf(b);
    return a.localeCompare(b, 'ar');
});

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const { user, loading: authLoading } = useContext(AuthContext);

  const [formDetails, setFormDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    governorate: egyptianGovernorates[0],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [availableShipping, setAvailableShipping] = useState<{company: ShippingCompany, cost: number}[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<{companyId: string, cost: number, name: string} | null>(null);
  
  useEffect(() => {
      const fetchSettings = async () => {
          const settings = await getShippingSettings();
          setShippingSettings(settings);
      }
      fetchSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setFormDetails(prev => ({ ...prev, email: user.email || '', fullName: user.displayName || '' }));
    }
  }, [user]);
  
  useEffect(() => {
    if (shippingSettings && formDetails.governorate) {
        const availableOptions = shippingSettings.companies
            .map(company => ({
                company,
                cost: company.prices[formDetails.governorate]
            }))
            .filter(option => typeof option.cost === 'number');
        
        setAvailableShipping(availableOptions);
        if (availableOptions.length > 0) {
            const firstOption = availableOptions[0];
            setSelectedShipping({ companyId: firstOption.company.id, cost: firstOption.cost, name: firstOption.company.name });
        } else {
            setSelectedShipping(null);
        }
    }
  }, [shippingSettings, formDetails.governorate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => {
                alert(`تم تحديد موقعك! سيتم ملء العنوان تلقائيًا.`);
                setFormDetails(prev => ({...prev, address: "تم التحديد من الخريطة", governorate: "القاهرة"}));
            },
            () => {
                alert("لا يمكن الوصول إلى موقعك. يرجى التحقق من الأذونات.");
            }
        );
    } else {
        alert("متصفحك لا يدعم تحديد الموقع.");
    }
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  useEffect(() => {
      if (appliedCoupon) {
          if (appliedCoupon.type === 'fixed') {
              setDiscountAmount(appliedCoupon.value);
          } else {
              setDiscountAmount((subtotal * appliedCoupon.value) / 100);
          }
      } else {
          setDiscountAmount(0);
      }
  }, [appliedCoupon, subtotal]);

  const total = subtotal + (selectedShipping?.cost || 0) - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setError('');
    try {
        const coupon = await getCouponByCode(couponCode);
        if (coupon) {
            setAppliedCoupon(coupon);
        } else {
            setError('كود الخصم غير صالح أو منتهي الصلاحية.');
            setAppliedCoupon(null);
        }
    } catch (err) {
        setError('حدث خطأ أثناء التحقق من الكود.');
        console.error(err);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
        setError('يرجى اختيار محافظة يتوفر بها الشحن.');
        return;
    }
    setLoading(true);
    setError('');

    let activeUser: AuthUser | null = user;
    
    if (!activeUser) {
        if(formDetails.password !== formDetails.confirmPassword) {
            setError("كلمتا المرور غير متطابقتين.");
            setLoading(false);
            return;
        }
        try {
            activeUser = await signUpUser(formDetails.email, formDetails.password, formDetails.fullName);
        } catch(err: any) {
             if (err.code === 'auth/email-already-in-use') {
                try {
                    activeUser = await signInUser(formDetails.email, formDetails.password);
                } catch (loginErr: any) {
                    setError("هذا الإيميل مسجل بالفعل، وكلمة المرور التي أدخلتها غير صحيحة.");
                    setLoading(false);
                    return;
                }
             } else {
                setError("فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
                setLoading(false);
                return;
             }
        }
    }
    
    if(!activeUser?.uid) {
        setError("حدث خطأ غير متوقع. يرجى تسجيل الدخول والمحاولة مرة أخرى.");
        setLoading(false);
        return;
    }

    const orderData: Omit<Order, 'id' | 'createdAt'> = {
        userId: activeUser.uid,
        customerDetails: {
            name: formDetails.fullName,
            email: formDetails.email,
            phone: formDetails.phone,
        },
        shippingAddress: {
            address: formDetails.address,
            city: formDetails.governorate, // For legacy compatibility
            governorate: formDetails.governorate,
        },
        items: cartItems,
        subtotal,
        shippingCost: selectedShipping.cost,
        shippingCompany: selectedShipping.name,
        total: Math.max(0, total),
        status: 'جديد',
    };

    if (appliedCoupon) {
        (orderData as Order).discountAmount = discountAmount;
        (orderData as Order).couponCode = appliedCoupon.code;
    }

    try {
        const orderId = await createOrder(orderData);
        await clearCart();
        navigate(`/order-success/${orderId}`);
    } catch (err) {
        console.error("Failed to create order:", err);
        setError("حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.");
        setLoading(false);
    }
  };
  
  const InputField: React.FC<any> = ({ label, ...props }) => (
      <div>
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" required />
      </div>
  );

  if (cartItems.length === 0) {
    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-extrabold mb-4">سلّتك فارغة</h1>
            <p className="text-lg text-gray-600 mb-8">لم لا تلقي نظرة على مجموعتنا الرائعة؟</p>
            <Link to="/" className="bg-brand-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90">
                تسوق الآن
            </Link>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="relative text-center mb-8">
            <button onClick={() => navigate(-1)} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary">
                 <ArrowLeft className="w-4 h-4" />
                <span>رجوع</span>
            </button>
            <h1 className="text-3xl font-extrabold">إتمام الطلب</h1>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-lg shadow-md">
                <form className="space-y-6" onSubmit={handleConfirmOrder}>
                  <h2 className="text-xl font-bold">1. بياناتك</h2>
                  <div className="space-y-4">
                    {user ? (
                        <p className="text-sm p-3 bg-blue-50 rounded-md">أنت تسجل الدخول حاليًا كـ <span className="font-semibold">{user.email}</span>.</p>
                    ) : (
                        <>
                        <InputField label="البريد الإلكتروني" id="email" name="email" placeholder="you@example.com" type="email" value={formDetails.email} onChange={handleInputChange} />
                        <p className="text-xs text-gray-500 -mt-2">سيتم إنشاء حساب لك تلقائيًا لإدارة طلباتك بسهولة.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="كلمة المرور" id="password" name="password" type="password" placeholder="••••••••" value={formDetails.password} onChange={handleInputChange} />
                            <InputField label="تأكيد كلمة المرور" id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formDetails.confirmPassword} onChange={handleInputChange} />
                        </div>
                        </>
                    )}
                    <InputField label="الاسم الكامل" id="fullName" name="fullName" placeholder="ادخل اسمك" value={formDetails.fullName} onChange={handleInputChange}/>
                    <InputField label="رقم الهاتف" id="phone" name="phone" placeholder="01xxxxxxxxx" type="tel" value={formDetails.phone} onChange={handleInputChange}/>
                  </div>
                  
                  <h2 className="text-xl font-bold pt-4">2. عنوان الشحن</h2>
                  <div className="space-y-4">
                     <div>
                        <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                        <select id="governorate" name="governorate" value={formDetails.governorate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                            {egyptianGovernorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">العنوان بالتفصيل</label>
                        <div className="flex items-center gap-2">
                           <input id="address" name="address" placeholder="الشارع، المنطقة" value={formDetails.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" required />
                           <button type="button" onClick={handleShareLocation} className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 px-3 rounded-md whitespace-nowrap">
                              <Share className="w-4 h-4"/>
                              <span>موقعي</span>
                           </button>
                        </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold pt-4">3. الدفع والشحن</h2>
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-6 h-6 text-gray-600"/>
                            <h3 className="font-semibold">ادفع ببطاقتك بأمان</h3>
                        </div>
                        <div className="p-4 bg-gray-200 rounded-md text-center text-gray-500">
                            Payment Gateway Placeholder (Paymob)
                        </div>
                    </div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                        <h4 className="font-semibold text-blue-800">التقسيط مع Paymob</h4>
                        <p className="text-xs text-blue-700 mt-1">خيار التقسيط سيظهر هنا تلقائيًا عند إدخال رقم بطاقة ائتمانية مدعومة.</p>
                    </div>
                  </div>
                   <div className="space-y-3">
                        {availableShipping.length > 0 ? availableShipping.map(({company, cost}) => (
                            <label key={company.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedShipping?.companyId === company.id ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-300'}`}>
                                <input type="radio" name="shipping" value={company.id} checked={selectedShipping?.companyId === company.id} onChange={() => setSelectedShipping({companyId: company.id, cost, name: company.name})} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                                <div className="mr-3 flex-grow">
                                    <p className="font-semibold">{company.name}</p>
                                </div>
                                <p className="font-semibold">{cost.toLocaleString()} جنيه</p>
                            </label>
                        )) : (
                            <p className="text-center text-sm text-red-600 p-2 bg-red-50 rounded-md">
                                عذرًا، لا يتوفر شحن لهذه المحافظة حاليًا.
                            </p>
                        )}
                    </div>
                  
                  {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                  <button type="submit" disabled={loading || authLoading || !selectedShipping} className="w-full mt-6 bg-brand-accent text-brand-primary py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:bg-gray-400">
                    {loading ? 'جاري تأكيد الطلب...' : `ادفع ${Math.max(0, total).toLocaleString()} جنيه`}
                  </button>
                </form>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md h-fit sticky top-32">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4 pb-4 border-b">
                        <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                        </div>
                        <p className="mr-auto font-semibold whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} جنيه</p>
                    </div>
                ))}
            </div>
            <div className="py-4 border-b space-y-2 mt-4">
                <p className="text-sm font-semibold">هل لديك كود خصم؟</p>
                <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="ادخل الكود" className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    <button onClick={handleApplyCoupon} className="bg-gray-200 px-4 rounded-md font-semibold">تطبيق</button>
                </div>
            </div>
            <div className="space-y-2 py-4 border-b text-sm">
                <div className="flex justify-between">
                    <span>السعر</span>
                    <span>{subtotal.toLocaleString()} جنيه</span>
                </div>
                 {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>الخصم ({appliedCoupon?.code})</span>
                        <span>- {discountAmount.toLocaleString()} جنيه</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>الشحن ({selectedShipping?.name || 'غير محدد'})</span>
                    <span>{selectedShipping ? `${selectedShipping.cost.toLocaleString()} جنيه` : 'N/A'}</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4">
                <span>الإجمالي</span>
                <span>{Math.max(0, total).toLocaleString()} جنيه</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;