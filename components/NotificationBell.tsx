import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from './icons';
import { NotificationContext } from '../contexts/NotificationContext';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = (notificationId: string, link: string) => {
        markAsRead(notificationId);
        navigate(link);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative" aria-label={`Notifications (${unreadCount} unread)`}>
                <Bell className="h-6 w-6 text-brand-primary" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>
                )}
            </button>
            {isOpen && (
                <div 
                    className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-md border z-20"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="p-3 border-b font-semibold">الإشعارات</div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div 
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n.id, n.link)}
                                    className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                                >
                                    <p className="text-sm">{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt.seconds * 1000).toLocaleString('ar-EG')}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-gray-500">لا توجد إشعارات جديدة.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
