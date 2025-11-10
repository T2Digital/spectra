import React from 'react';

const ReturnPolicyPage: React.FC = () => {
    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">سياسة الاستبدال والإرجاع</h1>
                    <p className="mt-2 text-lg text-gray-600">نحن نهتم برضاك التام عن مشترياتك.</p>
                </div>
                <div className="prose prose-lg max-w-none text-right mx-auto space-y-4 leading-relaxed">
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2 className="!mt-0">سياسة الإرجاع لمدة 14 يومًا</h2>
                        <p>
                            يمكنك إرجاع أي منتج قمت بشرائه خلال 14 يومًا من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية، غير مستخدم، وفي عبوته الأصلية بجميع ملحقاته.
                        </p>
                    </div>
                    
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2>كيفية طلب الإرجاع</h2>
                        <p>
                            لطلب إرجاع، يرجى التواصل مع فريق خدمة العملاء عبر البريد الإلكتروني على <a href="mailto:support@spectra.com" className="text-brand-accent">support@spectra.com</a> أو عبر الهاتف. يرجى تزويدنا برقم الطلب والمنتج الذي ترغب في إرجاعه وسبب الإرجاع.
                        </p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2>الاستبدال</h2>
                        <p>
                            نقدم خدمة استبدال المنتجات خلال 14 يومًا. إذا كنت ترغب في استبدال منتج بآخر، يرجى اتباع نفس خطوات طلب الإرجاع مع توضيح المنتج البديل الذي ترغبه. سيتم التعامل مع فرق السعر إن وجد.
                        </p>
                    </div>
                    
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2>المنتجات غير القابلة للإرجاع</h2>
                        <ul>
                            <li>العدسات اللاصقة بعد فتح عبوتها لأسباب صحية.</li>
                            <li>المنتجات التي تم استخدامها أو تعرضت للتلف بسبب سوء الاستخدام.</li>
                            <li>بطاقات الهدايا والقسائم الشرائية.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
