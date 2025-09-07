import React from 'react';
import CropHealth from '../components/Dashboard/CropHealth';
import WaterLevels from '../components/Dashboard/WaterLevels';
import NutrientLevels from '../components/Dashboard/NutrientLevels';
import PestDetection from '../components/Dashboard/PestDetection';
import FarmMap from '../components/Dashboard/FarmMap';
import ActionableInsights from '../components/Dashboard/ActionableInsights';
import Weather from '../components/Dashboard/Weather';
import CropHealthTest from '../components/test/CropHealthTest';

export default function Overview() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Farm Overview</h1>
        <p className="text-lg text-gray-600">Real-time monitoring of your agricultural operations</p>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Weather - Takes 4 columns on large screens */}
        <div className="lg:col-span-4">
          <Weather />
        </div>
        
        {/* Crop Health - Takes 4 columns on large screens */}
        <div className="lg:col-span-4">
          <CropHealth />
        </div>
        
        {/* Water Levels - Takes 4 columns on large screens */}
        <div className="lg:col-span-4">
          <WaterLevels />
        </div>
      </div>
      
      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Nutrient Levels */}
        <div>
          <NutrientLevels />
        </div>
        
        {/* Pest Detection */}
        <div>
          <PestDetection />
        </div>
        
        {/* Placeholder for future component */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Soil Analysis</h3>
          <p className="text-gray-600 text-sm">Advanced soil analysis coming soon...</p>
        </div>
      </div>
      
      {/* Actionable Insights - Full width */}
      <div className="mb-8">
        <ActionableInsights />
      </div>
      
      {/* Crop Health Test - Temporary for testing */}
      <div className="mb-8">
        <CropHealthTest />
      </div>
    </div>
  );
}