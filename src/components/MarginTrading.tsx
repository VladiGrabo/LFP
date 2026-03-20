import React, { useRef } from 'react';
import { Zap, Target, TrendingUp } from 'lucide-react';
import AssetSelector from './AssetSelector';
import TradingViewWidget from './TradingViewWidget';
import MarginOrderForm from './MarginOrderForm';
import MarginInfo from './MarginInfo';

interface MarginTradingProps {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  onNavigateToPortfolio?: () => void;
}

const MarginTrading: React.FC<MarginTradingProps> = ({ 
  selectedAsset, 
  setSelectedAsset, 
  onNavigateToPortfolio 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleAssetSelect = (asset: string) => {
    setSelectedAsset(asset);
    
    // Плавная прокрутка к графику
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Margin Trading</h2>
          <div className="flex items-center space-x-2 bg-orange-50 text-orange-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
            <Zap className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">High Leverage</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
            <span>Профессиональные графики для точного анализа</span>
          </div>
        </div>
      </div>

      <AssetSelector 
        selectedAsset={selectedAsset} 
        setSelectedAsset={setSelectedAsset}
        onAssetSelect={handleAssetSelect}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-3 order-1" ref={chartRef}>
          <TradingViewWidget
            symbol={selectedAsset}
            theme="light"
            interval="15"
            height={600}
          />
        </div>
        <div className="lg:col-span-1 order-2 space-y-4">
          <MarginOrderForm
            selectedAsset={selectedAsset}
            onNavigateToPortfolio={onNavigateToPortfolio}
          />
          <div className="hidden lg:block">
            <MarginInfo />
          </div>
        </div>
      </div>

      {/* Mobile Margin Info */}
      <div className="lg:hidden">
        <MarginInfo />
      </div>

      {/* Margin Trading Features */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Margin Trading Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
              <Zap className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">High Leverage</h4>
              <p className="text-xs md:text-sm text-gray-600">Trade with up to 100x leverage for maximum exposure</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">Advanced Orders</h4>
              <p className="text-xs md:text-sm text-gray-600">Stop-loss, take-profit, and trailing stops</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm md:text-base">Short Selling</h4>
              <p className="text-xs md:text-sm text-gray-600">Profit from falling prices with short positions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarginTrading;