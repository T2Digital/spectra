import React, { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import type { Notification } from '../types';
import { AuthContext } from './AuthContext';
import { listenToUserNotifications, markNotificationAsRead } from '../firebase/services';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        if (user) {
            unsubscribe = listenToUserNotifications(user.uid, (newNotifications) => {
                setNotifications(newNotifications);
            });
        } else {
            setNotifications([]);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAsRead = async (notificationId: string) => {
        if (user) {
            // Optimistic update
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            try {
                await markNotificationAsRead(user.uid, notificationId);
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
                // Revert on failure
                 setNotifications(prev => 
                    prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
                );
            }
        }
    };

    const contextValue = useMemo(() => ({
        notifications,
        unreadCount,
        markAsRead
    }), [notifications, unreadCount]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
