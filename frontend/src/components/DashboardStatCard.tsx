import React from 'react';

interface DashboardStatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  colorClass: string;
  loading?: boolean;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ label, count, icon, colorClass, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        )}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default DashboardStatCard;
