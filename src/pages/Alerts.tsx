import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, Info } from 'lucide-react';
import ActionableInsights from '../components/Dashboard/ActionableInsights';
import { getCurrentWeather } from '../services/weather.service';
import { 
  calculateCropHealth, 
  getDefaultNutrients, 
  CropHealthData 
} from '../services/cropHealth.service';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'weather' | 'crop' | 'system' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  icon: React.ReactNode;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [cropHealthData, setCropHealthData] = useState<CropHealthData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch weather and crop health data
        const weather = await getCurrentWeather();
        setWeatherData(weather);
        
        const nutrients = getDefaultNutrients();
        const weatherConditions = {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          rainfall: 0,
          windSpeed: weather.wind.speed
        };
        
        const health = calculateCropHealth(nutrients, weatherConditions);
        setCropHealthData(health);
        
        // Generate alerts based on data
        const generatedAlerts = generateAlerts(weather, health);
        setAlerts(generatedAlerts);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlerts(getFallbackAlerts());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateAlerts = (weather: any, health: CropHealthData): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    // Weather alerts
    if (weather) {
      const { main, weather: weatherConditions, wind, name } = weather;
      
      if (main.temp > 35) {
        alerts.push({
          id: 'temp-high',
          title: 'High Temperature Alert',
          description: `Temperature in ${name} is ${Math.round(main.temp)}°C. Crops may experience heat stress.`,
          type: 'weather',
          priority: 'high',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      }
      
      if (main.temp < 5) {
        alerts.push({
          id: 'temp-low',
          title: 'Frost Risk Alert',
          description: `Temperature in ${name} is ${Math.round(main.temp)}°C. Frost risk detected!`,
          type: 'weather',
          priority: 'critical',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      }
      
      if (main.humidity > 80) {
        alerts.push({
          id: 'humidity-high',
          title: 'High Humidity Alert',
          description: `Humidity is ${main.humidity}%. Monitor for fungal diseases.`,
          type: 'weather',
          priority: 'medium',
          timestamp: now,
          resolved: false,
          icon: <Info className="w-5 h-5" />
        });
      }
      
      if (wind.speed > 15) {
        alerts.push({
          id: 'wind-high',
          title: 'Strong Wind Warning',
          description: `Wind speed is ${wind.speed} m/s. Secure equipment and monitor crops.`,
          type: 'weather',
          priority: 'medium',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      }
    }

    // Crop health alerts
    if (health) {
      if (health.overallHealth < 5) {
        alerts.push({
          id: 'health-critical',
          title: 'Critical Crop Health',
          description: `Crop health is ${health.overallHealth.toFixed(1)}/10. Immediate intervention required!`,
          type: 'crop',
          priority: 'critical',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      }
      
      if (health.growthRate < 0) {
        alerts.push({
          id: 'growth-negative',
          title: 'Negative Growth Rate',
          description: `Growth rate is ${health.growthRate}%. Crops are under stress.`,
          type: 'crop',
          priority: 'high',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      }

      // Critical health issues
      const criticalIssues = health.issues.filter(issue => issue.severity === 'critical');
      criticalIssues.forEach((issue, index) => {
        alerts.push({
          id: `issue-critical-${index}`,
          title: `Critical: ${issue.description}`,
          description: `Immediate action required for this critical issue.`,
          type: 'crop',
          priority: 'critical',
          timestamp: now,
          resolved: false,
          icon: <AlertTriangle className="w-5 h-5" />
        });
      });
    }

    // System alerts
    alerts.push({
      id: 'system-update',
      title: 'System Update Available',
      description: 'A new version of the agricultural monitoring system is available.',
      type: 'system',
      priority: 'low',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      resolved: false,
      icon: <Info className="w-5 h-5" />
    });

    // Sort by priority and timestamp
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return alerts;
  };

  const getFallbackAlerts = (): Alert[] => [
    {
      id: 'loading',
      title: 'Loading Alerts',
      description: 'Fetching real-time alerts and notifications...',
      type: 'system',
      priority: 'low',
      timestamp: new Date(),
      resolved: false,
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weather':
        return 'bg-blue-100 text-blue-700';
      case 'crop':
        return 'bg-green-100 text-green-700';
      case 'system':
        return 'bg-purple-100 text-purple-700';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical').length;
  const highAlerts = alerts.filter(alert => alert.priority === 'high').length;
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved).length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and alerts for your farm</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{unresolvedAlerts}</div>
            <div className="text-sm text-gray-500">Active Alerts</div>
          </div>
          <Bell className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{highAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Weather</p>
              <p className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => a.type === 'weather').length}
              </p>
            </div>
            <Info className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Crop Health</p>
              <p className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.type === 'crop').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Actionable Insights */}
        <ActionableInsights />
        
        {/* Detailed Alerts List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed list of all alerts and notifications</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading alerts...</span>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">All Clear!</h3>
                <p className="text-gray-600">No active alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.priority === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.priority === 'high' ? 'bg-orange-50 border-orange-400' :
                      alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {alert.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-800">
                            {alert.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(alert.priority)}`}>
                              {alert.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${getTypeColor(alert.type)}`}>
                            {alert.type}
                          </span>
                          {!alert.resolved && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}