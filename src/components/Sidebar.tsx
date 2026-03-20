import React from 'react';
import { BarChart3, TrendingUp, Wallet, Globe, ChevronRight, Zap, Target, X, CreditCard, User } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: 'dashboard' | 'spot-trading' | 'margin-trading' | 'portfolio' | 'market' | 'wallet' | 'profile') => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isMobileMenuOpen = false,
  onMobileMenuClose 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'spot-trading', label: 'Spot Trading', icon: TrendingUp },
    { id: 'margin-trading', label: 'Margin Trading', icon: Zap },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'market', label: 'Market Overview', icon: Globe },
    { id: 'wallet', label: 'Wallet & Withdraw', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveView(itemId as any);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onMobileMenuClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm md:text-base">{item.label}</span>
                    </div>
                    {item.id === 'margin-trading' && (
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3 text-orange-500" />
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}
                    {item.id === 'wallet' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}
                    {item.id === 'profile' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}
                    {isActive && !['margin-trading', 'wallet', 'profile'].includes(item.id) && <ChevronRight className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;