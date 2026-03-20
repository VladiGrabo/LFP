import React, { useState } from 'react';
import { TrendingUp, User, Settings, Bell, Menu, X, Plus } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onDepositClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen, onDepositClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <h1 className="text-lg md:text-xl font-bold text-gray-900">TradeHub Pro</h1>
          </div>

          <div className="hidden lg:flex items-center space-x-4 ml-8">
            <div className="text-sm">
              <span className="text-gray-600">Portfolio Value:</span>
              <span className="text-green-600 font-semibold ml-2">$125,432.18</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Day P&L:</span>
              <span className="text-green-600 font-semibold ml-2">+$2,341.52</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={onDepositClick}
            className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Deposit</span>
          </button>
          {/* Mobile portfolio info */}
          <div className="lg:hidden text-right">
            <div className="text-xs text-gray-600">Portfolio</div>
            <div className="text-sm font-semibold text-green-600">$125.4K</div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </button>
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-2 md:px-3 py-2 rounded-lg transition-colors">
            <User className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline text-sm md:text-base">John Doe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;