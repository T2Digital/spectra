import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from '../components/icons';
import { getOrderById } from '../firebase/services';
import type { Order } from '../types';

const OrderSuccessPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                try {
                    const fetchedOrder = await getOrderById(orderId);
                    setOrder(fetchedOrder);
                } catch (error) {
                    console.error("Failed to fetch order details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleWhatsAppShare = () => {
        if (!order) return;
        const adminPhoneNumber = "201005896101";
        
        let message = `*طلب جديد من Spectra* ✨\n\n`;
        message += `*رقم الطلب:* ${order.id}\n`;
        message += `*العميل:* ${order.customerDetails.name}\n`;
        message += `*الهاتف:* ${order.customerDetails.phone}\n\n`;
        message += `*المنتجات:*\n`;
        order.items.forEach(item => {
            message += `- ${item.name} (الكمية: ${item.quantity})\n`;
        });
        message += `\n*الإجمالي:* ${order.total.toLocaleString()} جنيه\n`;
        message += `*العنوان:* ${order.shippingAddress.address}, ${order.shippingAddress.city}\n\n`;
        message += `شكراً لتسوقكم معنا! \nhttps://spectra-store.com`;

        const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };


    return (
        <div className="bg-gray-50 min-h-[70vh] flex items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl text-center max-w-2xl mx-auto">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold text-brand-primary mb-2">شكرًا لك على طلبك!</h1>
                <p className="text-lg text-gray-600">لقد تم استلام طلبك بنجاح وسنقوم بمعالجته قريبًا.</p>

                {loading ? (
                    <div className="mt-6 animate-pulse bg-gray-100 h-8 w-48 mx-auto rounded-md"></div>
                ) : order ? (
                    <div className="mt-6 text-sm text-gray-500">
                        <p>رقم طلبك هو:</p>
                        <p className="text-lg font-bold text-brand-primary bg-gray-100 px-4 py-2 rounded-md inline-block mt-2">
                            {order.id}
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 text-red-500">
                        <p>لم نتمكن من العثور على تفاصيل طلبك.</p>
                    </div>
                )}
                
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/products" className="bg-brand-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 w-full sm:w-auto">
                        متابعة التسوق
                    </Link>
                    <button onClick={handleWhatsAppShare} disabled={!order} className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 w-full sm:w-auto disabled:bg-gray-400">
                        تأكيد الطلب على واتساب
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;