import React from 'react';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, changeType, className }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    return (
        <div className={`bg-white p-6 rounded-lg shadow-md flex items-center gap-4 ${className}`}>
            <div className="bg-brand-accent/10 p-3 rounded-full">
                <Icon className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {change && (
                    <p className={`text-xs font-semibold ${changeColor}`}>{change}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;