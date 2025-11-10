import React from 'react';
import Accordion from '../components/Accordion';

const faqs = [
  {
    question: "ما هي مدة الشحن المتوقعة؟",
    answer: "الشحن داخل القاهرة والجيزة يستغرق من 2-3 أيام عمل. الشحن لباقي المحافظات يستغرق من 3-5 أيام عمل."
  },
  {
    question: "هل يمكنني إرجاع أو استبدال المنتج؟",
    answer: "نعم، يمكنك إرجاع أو استبدال المنتج خلال 14 يومًا من تاريخ الاستلام. يرجى مراجعة صفحة سياسة الإرجاع لمزيد من التفاصيل حول الشروط."
  },
  {
    question: "هل النظارات أصلية؟",
    answer: "بالتأكيد. جميع منتجاتنا أصلية 100% ونحن وكلاء معتمدون لجميع الماركات التي نعرضها."
  },
  {
    question: "كيف يمكنني استخدام ميزة التجربة الافتراضية؟",
    answer: "اذهب إلى صفحة المنتج الذي يعجبك واضغط على زر 'جرّب النظارة افتراضيًا'. ستحتاج إلى السماح للمتصفح باستخدام الكاميرا الخاصة بك لتعمل الميزة."
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    answer: "نحن نقبل الدفع عن طريق بطاقات الائتمان (Visa/Mastercard) من خلال بوابة الدفع الآمنة Paymob، بالإضافة إلى خيار الدفع عند الاستلام."
  }
];

const FaqPage: React.FC = () => {
    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">الأسئلة الشائعة</h1>
                    <p className="mt-2 text-lg text-gray-600">كل ما تحتاج معرفته عن التسوق من Spectra.</p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Accordion key={index} title={faq.question}>
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </Accordion>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
