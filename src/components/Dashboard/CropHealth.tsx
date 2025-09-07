import React, { useEffect, useState } from 'react';
import { Sprout, TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, TrendingDown } from 'lucide-react';
import { 
  calculateCropHealth, 
  getDefaultNutrients, 
  getDefaultWeather,
  getDefaultCrop,
  CropHealthData,
  HealthIssue 
} from '../../services/cropHealth.service';

export default function CropHealth() {
  const [healthData, setHealthData] = useState<CropHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHealthData = async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get default data (in real app, this would come from API/sensors)
      const nutrients = getDefaultNutrients();
      const weather = getDefaultWeather();
      const crop = getDefaultCrop();
      
      // Calculate health using the FIXED bounded formula
      console.log('🌱 Calculating crop health with bounded formula...');
      console.log('📊 Nutrients:', nutrients);
      console.log('🌤️ Weather:', weather);
      console.log('🌾 Crop:', crop);
      
      const health = calculateCropHealth(nutrients, weather, crop);
      console.log('🎯 Health result:', health);
      
      // Validate the result to ensure it's within bounds
      if (health.overallHealth < 0 || health.overallHealth > 1) {
        throw new Error('Health calculation out of bounds');
      }
      
      setHealthData(health);
    } catch (err) {
      console.error('Error calculating crop health:', err);
      setError('Failed to calculate crop health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const getHealthColor = (score: number) => {
    // Ensure score is between 0-100
    const normalizedScore = Math.max(0, Math.min(100, score));
    
    if (normalizedScore >= 85) return { 
      bg: 'bg-green-500', 
      text: 'text-green-800', 
      bgLight: 'bg-green-100',
      borderColor: 'border-green-200'
    };
    if (normalizedScore >= 70) return { 
      bg: 'bg-blue-500', 
      text: 'text-blue-800', 
      bgLight: 'bg-blue-100',
      borderColor: 'border-blue-200'
    };
    if (normalizedScore >= 50) return { 
      bg: 'bg-yellow-500', 
      text: 'text-yellow-800', 
      bgLight: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    };
    if (normalizedScore >= 30) return { 
      bg: 'bg-orange-500', 
      text: 'text-orange-800', 
      bgLight: 'bg-orange-100',
      borderColor: 'border-orange-200'
    };
    return { 
      bg: 'bg-red-500', 
      text: 'text-red-800', 
      bgLight: 'bg-red-100',
      borderColor: 'border-red-200'
    };
  };

  const getHealthStatus = (score: number) => {
    const normalizedScore = Math.max(0, Math.min(100, score));
    if (normalizedScore >= 85) return 'Excellent';
    if (normalizedScore >= 70) return 'Good';
    if (normalizedScore >= 50) return 'Fair';
    if (normalizedScore >= 30) return 'Poor';
    return 'Critical';
  };

  const getHealthGrade = (score: number) => {
    const normalizedScore = Math.max(0, Math.min(100, score));
    if (normalizedScore >= 90) return 'A+';
    if (normalizedScore >= 85) return 'A';
    if (normalizedScore >= 80) return 'A-';
    if (normalizedScore >= 75) return 'B+';
    if (normalizedScore >= 70) return 'B';
    if (normalizedScore >= 65) return 'B-';
    if (normalizedScore >= 60) return 'C+';
    if (normalizedScore >= 55) return 'C';
    if (normalizedScore >= 50) return 'C-';
    if (normalizedScore >= 40) return 'D';
    return 'F';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
            <span className="text-gray-600 text-sm">Analyzing crop health...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-semibold">Health Analysis Failed</p>
          <p className="text-sm text-gray-600 mb-3">{error || 'Unable to analyze crop health'}</p>
          <button
            onClick={() => loadHealthData()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  const healthScore = Math.round(healthData.overallHealth * 100);
  const healthColors = getHealthColor(healthScore);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Crop Health</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadHealthData(true)}
            disabled={refreshing}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            title="Refresh health data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Sprout className="w-6 h-6 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Overall Health Score */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Wheat Health</span>
          <span className={`px-3 py-1 ${healthColors.bgLight} ${healthColors.text} rounded-full text-sm font-medium border ${healthColors.borderColor}`}>
            {getHealthStatus(healthScore)} ({getHealthGrade(healthScore)})
          </span>
        </div>
        
        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Health Score</span>
            <span>{healthScore}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${healthColors.bg} rounded-full transition-all duration-500 ease-in-out`} 
              style={{ width: `${Math.max(2, healthScore)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Growth Rate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Growth Rate</span>
          <div className={`flex items-center ${healthData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {healthData.growthRate >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="font-medium">
              {healthData.growthRate >= 0 ? '+' : ''}{healthData.growthRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {healthData.issues.some(issue => issue.severity === 'critical') && (
          <div className="flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <div>
              <span className="text-sm font-semibold text-red-800">Critical Issues Detected</span>
              <p className="text-xs text-red-700">Immediate attention required to prevent yield loss</p>
            </div>
          </div>
        )}

        {/* Health Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border">
            <span className="text-gray-600">Nutrients:</span>
            <span className="ml-1 font-medium">{healthData.details.nutrientScore}%</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border">
            <span className="text-gray-600">Growth:</span>
            <span className="ml-1 font-medium">{healthData.details.growthScore}%</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border">
            <span className="text-gray-600">Environment:</span>
            <span className="ml-1 font-medium">{healthData.details.environmentalScore}%</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border">
            <span className="text-gray-600">Disease:</span>
            <span className="ml-1 font-medium">{healthData.details.diseaseScore}%</span>
          </div>
        </div>

        {/* Health Issues */}
        {healthData.issues.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Health Issues</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {healthData.issues.slice(0, 4).map((issue: HealthIssue, index: number) => (
                <div key={index} className={`flex items-start space-x-2 p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">
                      {issue.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 capitalize">
                        {issue.type} • {issue.severity} severity
                      </p>
                      <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border">
                        Impact: {Math.max(0, Math.min(10, issue.impact))}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {healthData.issues.length > 4 && (
                <div className="text-center py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    +{healthData.issues.length - 4} more issues
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {healthData.recommendations.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {healthData.recommendations.slice(0, 3).map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
              {healthData.recommendations.length > 3 && (
                <div className="text-center py-1 border-t border-blue-200">
                  <p className="text-xs text-gray-500">
                    +{healthData.recommendations.length - 3} more recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}