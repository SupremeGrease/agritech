import React, { useState } from 'react';
import { calculateCropHealth, getDefaultNutrients, getTestNutrientsHighPotassium, getTestNutrientsOptimal, getDefaultWeather } from '../../services/cropHealth.service';

export default function CropHealthTest() {
  const [testMode, setTestMode] = useState<'normal' | 'high-potassium' | 'optimal'>('normal');
  
  const defaultNutrients = getDefaultNutrients();
  const highPotassiumNutrients = getTestNutrientsHighPotassium();
  const optimalNutrients = getTestNutrientsOptimal();
  const weather = getDefaultWeather();
  
  const defaultHealth = calculateCropHealth(defaultNutrients, weather);
  const highPotassiumHealth = calculateCropHealth(highPotassiumNutrients, weather);
  const optimalHealth = calculateCropHealth(optimalNutrients, weather);
  
  const getCurrentNutrients = () => {
    switch (testMode) {
      case 'high-potassium': return highPotassiumNutrients;
      case 'optimal': return optimalNutrients;
      default: return defaultNutrients;
    }
  };
  
  const getCurrentHealth = () => {
    switch (testMode) {
      case 'high-potassium': return highPotassiumHealth;
      case 'optimal': return optimalHealth;
      default: return defaultHealth;
    }
  };
  
  const currentNutrients = getCurrentNutrients();
  const currentHealth = getCurrentHealth();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Crop Health Formula Test</h2>
      <p className="text-sm text-gray-600 mb-4">Test the new non-additive crop health calculation formula</p>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setTestMode('normal')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              testMode === 'normal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Normal Data
          </button>
          <button
            onClick={() => setTestMode('high-potassium')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              testMode === 'high-potassium' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            High Potassium (30%)
          </button>
          <button
            onClick={() => setTestMode('optimal')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              testMode === 'optimal' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Optimal Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Data */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            {testMode === 'normal' ? 'Normal Data' : 
             testMode === 'high-potassium' ? 'High Potassium Test (30%)' : 
             'Optimal Data'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Nitrogen:</span>
              <span className={currentNutrients.nitrogen > 4 ? 'text-red-600 font-semibold' : ''}>
                {currentNutrients.nitrogen}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phosphorus:</span>
              <span className={currentNutrients.phosphorus > 0.3 ? 'text-red-600 font-semibold' : ''}>
                {currentNutrients.phosphorus}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Potassium:</span>
              <span className={currentNutrients.potassium > 0.5 ? 'text-red-600 font-semibold' : ''}>
                {currentNutrients.potassium}% {currentNutrients.potassium > 0.5 ? '⚠️' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span>pH:</span>
              <span className={currentNutrients.ph < 6 || currentNutrients.ph > 7.5 ? 'text-red-600 font-semibold' : ''}>
                {currentNutrients.ph}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Organic Matter:</span>
              <span className={currentNutrients.organicMatter > 5 ? 'text-red-600 font-semibold' : ''}>
                {currentNutrients.organicMatter}%
              </span>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded ${
            currentHealth.overallHealth >= 8 ? 'bg-green-50' :
            currentHealth.overallHealth >= 6 ? 'bg-yellow-50' :
            currentHealth.overallHealth >= 4 ? 'bg-orange-50' :
            'bg-red-50'
          }`}>
            <div className="font-semibold text-lg">
              Health Score: {currentHealth.overallHealth.toFixed(1)}/10
            </div>
            <div className="text-sm">
              Status: <span className={`font-medium ${
                currentHealth.overallHealth >= 8 ? 'text-green-700' :
                currentHealth.overallHealth >= 6 ? 'text-yellow-700' :
                currentHealth.overallHealth >= 4 ? 'text-orange-700' :
                'text-red-700'
              }`}>
                {currentHealth.healthStatus}
              </span>
            </div>
            <div className="text-sm">
              Growth Rate: <span className={currentHealth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {currentHealth.growthRate >= 0 ? '+' : ''}{currentHealth.growthRate}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Comparison Data */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Comparison</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">Normal Data:</span>
              <span className="font-semibold">{defaultHealth.overallHealth.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="text-sm">High Potassium:</span>
              <span className="font-semibold text-red-700">{highPotassiumHealth.overallHealth.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm">Optimal Data:</span>
              <span className="font-semibold text-green-700">{optimalHealth.overallHealth.toFixed(1)}/10</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Key Differences:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• High potassium (30%) = {highPotassiumHealth.overallHealth.toFixed(1)}/10 (CRITICAL)</li>
              <li>• Normal data = {defaultHealth.overallHealth.toFixed(1)}/10</li>
              <li>• Optimal data = {optimalHealth.overallHealth.toFixed(1)}/10</li>
              <li>• Formula now uses LOWEST score (limiting factor)</li>
              <li>• No more additive scoring that masks problems</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Issues and Recommendations */}
      {currentHealth.issues.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Issues Detected:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentHealth.issues.map((issue, index) => (
              <div key={index} className={`p-3 rounded text-sm border-l-4 ${
                issue.severity === 'critical' ? 'bg-red-50 border-red-400' :
                issue.severity === 'high' ? 'bg-orange-50 border-orange-400' :
                issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="font-medium">{issue.description}</div>
                <div className="text-xs text-gray-600 capitalize mt-1">
                  {issue.type} • {issue.severity} severity
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {currentHealth.recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Recommendations:</h4>
          <div className="space-y-2">
            {currentHealth.recommendations.map((rec, index) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                • {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
