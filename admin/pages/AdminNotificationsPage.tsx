import React, { useState } from 'react';

const AdminNotificationsPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            setFeedback('يرجى ملء العنوان والرسالة.');
            return;
        }
        setLoading(true);
        setFeedback('جاري إرسال الإشعار...');

        // --- Placeholder for Backend Logic ---
        // In a real application, this would trigger a Firebase Cloud Function.
        // The function would fetch all user FCM tokens from Firestore and send the notification.
        console.log("Sending Push Notification:", { title, message });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        setLoading(false);
        setFeedback('تم إرسال الإشعار بنجاح (محاكاة). لتفعيل الإشعارات الفعلية، يلزم إعداد Firebase Cloud Messaging و Cloud Functions.');
        setTitle('');
        setMessage('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إرسال إشعار عام</h1>
            <p className="text-sm text-gray-500 mb-4">
                سيتم إرسال هذا الإشعار (Push Notification) إلى جميع المستخدمين الذين سمحوا بتلقي الإشعارات على أجهزتهم.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">عنوان الإشعار</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="مثال: خصم 30% لفترة محدودة!"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">نص الرسالة</label>
                    <textarea
                        id="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="لا تفوت فرصة الحصول على نظارتك المفضلة بسعر لا يقاوم."
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400"
                >
                    {loading ? 'جاري الإرسال...' : 'إرسال الإشعار للجميع'}
                </button>
            </form>
            {feedback && (
                <p className={`mt-4 text-sm ${loading ? 'text-blue-600' : 'text-green-600'}`}>{feedback}</p>
            )}
        </div>
    );
};

export default AdminNotificationsPage;
