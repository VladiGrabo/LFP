import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const QuickStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Balance',
      value: '$125,432.18',
      change: '+2.34%',
      icon: DollarSign,
      positive: true,
    },
    {
      title: 'Available Margin',
      value: '$45,231.92',
      change: '+8.12%',
      icon: Percent,
      positive: true,
    },
    {
      title: 'Open Positions',
      value: '12',
      change: '+3',
      icon: TrendingUp,
      positive: true,
    },
    {
      title: 'Today P&L',
      value: '+$2,341.52',
      change: '+1.87%',
      icon: TrendingUp,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs md:text-sm">{stat.title}</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.positive ? (
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs md:text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-2 md:p-3 rounded-lg">
                <Icon className="h-4 w-4 md:h-6 md:w-6 text-gray-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;