import React from 'react';
import { Phone, Mail, MapPin } from '../components/icons';

const ContactInfoCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="bg-brand-accent/10 p-3 rounded-full">
            <Icon className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="text-gray-600">{children}</div>
        </div>
    </div>
);

const ContactPage: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle form submission, e.g., send data to an API endpoint.
        alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
    }
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">تواصل معنا</h1>
                    <p className="mt-2 text-lg text-gray-600">نحن هنا للمساعدة. كيف يمكننا خدمتك اليوم؟</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                                <input type="text" id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">رسالتك</label>
                                <textarea id="message" name="message" rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary" required></textarea>
                            </div>
                            <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                                إرسال الرسالة
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8 mt-8 md:mt-0">
                         <ContactInfoCard icon={Phone} title="الهاتف">
                            <p>+20 123 456 7890</p>
                            <p className="text-sm">السبت - الخميس, 9ص - 5م</p>
                        </ContactInfoCard>
                         <ContactInfoCard icon={Mail} title="البريد الإلكتروني">
                            <p>support@spectra.com</p>
                            <p className="text-sm">سيتم الرد خلال 24 ساعة</p>
                        </ContactInfoCard>
                         <ContactInfoCard icon={MapPin} title="العنوان">
                            <p>123 شارع التسوق, القاهرة الجديدة</p>
                            <p className="text-sm">القاهرة, مصر</p>
                        </ContactInfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
