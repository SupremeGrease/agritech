import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CropHealth from './CropHealth';
import WaterLevels from './WaterLevels';
import NutrientLevels from './NutrientLevels';
import PestDetection from './PestDetection';
// import FarmMap from './FarmMap';
import Weather from './Weather';
import ActionableInsights from './ActionableInsights';

export default function DashboardLayout() {
  const [showMenuButton, setShowMenuButton] = useState(false);

  const handleMenuClick = () => {
    // Handle menu click logic here
    console.log('Menu clicked');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={handleMenuClick}
          showMenuButton={showMenuButton}
        />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {/* Priority Components - Most Important Information First */}
            <div className="order-1">
              <CropHealth />
            </div>
            
            <div className="order-2">
              <Weather />
            </div>
            
            <div className="order-3">
              <WaterLevels />
            </div>
            
            <div className="order-4">
              <NutrientLevels />
            </div>
            
            <div className="order-5">
              <PestDetection />
            </div>
            
            <div className="order-6">
              <ActionableInsights />
            </div>
            
            {/* Future components can be added here */}
            {/* <div className="order-7">
              <FarmMap />
            </div> */}
          </div>
          
          {/* Optional: Add a summary section at the bottom */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Farm Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-gray-600">System Online</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <p className="text-gray-600">Active Sensors</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <p className="text-gray-600">Alerts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <p className="text-gray-600">Recommendations</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}