import React from 'react';
import { AlertTriangle, Info, Calculator } from 'lucide-react';

const MarginInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Info className="h-4 w-4 md:h-5 md:w-5 mr-2" />
        Margin Info
      </h3>
      
      <div className="space-y-4">
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
            <span className="text-xs md:text-sm font-medium text-red-800">Liquidation Risk</span>
          </div>
          <p className="text-xs text-red-700">
            Your position will be automatically closed if losses reach 80% of your margin.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-600">Maintenance Margin:</span>
            <span className="font-medium">0.5%</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-600">Trading Fee:</span>
            <span className="font-medium">0.1%</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-600">Funding Rate:</span>
            <span className="font-medium text-green-600">0.01%</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-600">Next Funding:</span>
            <span className="font-medium">2h 34m</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-800">Risk Calculator</span>
          </div>
          <p className="text-xs text-blue-700">
            Use our risk calculator to determine optimal position sizes and stop-loss levels.
          </p>
          <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
            Open Calculator
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarginInfo;