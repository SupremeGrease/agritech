import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getCurrentWeather } from '../../services/weather.service';
import { 
  calculateCropHealth, 
  getDefaultNutrients, 
  getDefaultWeather,
  CropHealthData,
  HealthIssue 
} from '../../services/cropHealth.service';

interface Insight {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'crop' | 'nutrient' | 'pest' | 'general';
  icon: React.ReactNode;
}

export default function ActionableInsights() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [cropHealthData, setCropHealthData] = useState<CropHealthData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch weather data
        const weather = await getCurrentWeather();
        setWeatherData(weather);
        
        // Calculate crop health
        const nutrients = getDefaultNutrients();
        const weatherConditions = {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          rainfall: 0, // Would come from weather forecast
          windSpeed: weather.wind.speed
        };
        
        const health = calculateCropHealth(nutrients, weatherConditions);
        setCropHealthData(health);
        
        // Generate insights based on data
        const generatedInsights = generateInsights(weather, health);
        setInsights(generatedInsights);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback insights
        setInsights(getFallbackInsights());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const generateInsights = (weather: any, health: CropHealthData): Insight[] => {
    const insights: Insight[] = [];

    // Weather-based insights
    if (weather) {
      const { main, weather: weatherConditions, wind, name } = weather;
      
      if (weatherConditions.some((w: any) => w.main === 'Rain')) {
        insights.push({
          title: 'Rainfall Alert',
          description: `It is currently raining in ${name}. Consider turning off irrigation systems.`,
          priority: 'high',
          type: 'weather',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      }
      
      if (main.temp > 35) {
        insights.push({
          title: 'High Temperature Warning',
          description: `Temperature is ${Math.round(main.temp)}°C. Ensure adequate irrigation and provide shade.`,
          priority: 'high',
          type: 'weather',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      }
      
      if (main.temp < 5) {
        insights.push({
          title: 'Frost Risk Alert',
          description: `Temperature is ${Math.round(main.temp)}°C. Protect crops with covers immediately.`,
          priority: 'critical',
          type: 'weather',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      }
      
      if (main.humidity > 80) {
        insights.push({
          title: 'High Humidity Alert',
          description: `Humidity is ${main.humidity}%. Monitor crops for fungal diseases.`,
          priority: 'medium',
          type: 'weather',
          icon: <Info className="w-4 h-4" />
        });
      }
      
      if (wind.speed > 15) {
        insights.push({
          title: 'Strong Wind Warning',
          description: `Wind speed is ${wind.speed} m/s. Secure equipment and monitor for damage.`,
          priority: 'medium',
          type: 'weather',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      }
    }

    // Crop health-based insights
    if (health) {
      // Critical health issues
      const criticalIssues = health.issues.filter(issue => issue.severity === 'critical');
      criticalIssues.forEach(issue => {
        insights.push({
          title: `Critical: ${issue.description}`,
          description: `Immediate action required. ${health.recommendations[0] || 'Check crop health immediately.'}`,
          priority: 'critical',
          type: 'crop',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      });

      // High priority health issues
      const highIssues = health.issues.filter(issue => issue.severity === 'high');
      highIssues.forEach(issue => {
        insights.push({
          title: `High Priority: ${issue.description}`,
          description: `Address this issue soon to prevent further damage.`,
          priority: 'high',
          type: 'crop',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      });

      // General health recommendations
      if (health.overallHealth < 5) {
        insights.push({
          title: 'Crop Health Critical',
          description: `Overall health is ${health.overallHealth.toFixed(1)}/10. Immediate intervention needed.`,
          priority: 'critical',
          type: 'crop',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      } else if (health.overallHealth < 7) {
        insights.push({
          title: 'Crop Health Needs Attention',
          description: `Overall health is ${health.overallHealth.toFixed(1)}/10. Consider implementing recommendations.`,
          priority: 'high',
          type: 'crop',
          icon: <Info className="w-4 h-4" />
        });
      } else if (health.overallHealth >= 8.5) {
        insights.push({
          title: 'Excellent Crop Health',
          description: `Crops are performing well with ${health.overallHealth.toFixed(1)}/10 health score.`,
          priority: 'low',
          type: 'crop',
          icon: <CheckCircle className="w-4 h-4" />
        });
      }

      // Growth rate insights
      if (health.growthRate < 0) {
        insights.push({
          title: 'Negative Growth Rate',
          description: `Growth rate is ${health.growthRate}%. Crops may be under stress.`,
          priority: 'high',
          type: 'crop',
          icon: <AlertTriangle className="w-4 h-4" />
        });
      } else if (health.growthRate > 15) {
        insights.push({
          title: 'Excellent Growth Rate',
          description: `Growth rate is ${health.growthRate}%. Crops are thriving!`,
          priority: 'low',
          type: 'crop',
          icon: <CheckCircle className="w-4 h-4" />
        });
      }
    }

    // Sort by priority (critical first)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return insights.slice(0, 6); // Limit to 6 insights
  };

  const getFallbackInsights = (): Insight[] => [
    {
      title: 'System Initializing',
      description: 'Loading real-time data and generating personalized insights...',
      priority: 'low',
      type: 'general',
      icon: <Info className="w-4 h-4" />
    }
  ];
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Actionable Insights</h2>
          <Lightbulb className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-2 text-gray-600">Analyzing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Actionable Insights</h2>
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          {insights.length > 0 && (
            <span className="text-sm text-gray-500">
              {insights.filter(i => i.priority === 'critical').length} critical, {insights.filter(i => i.priority === 'high').length} high priority
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-medium">All Good!</p>
            <p className="text-sm">No immediate actions required</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                insight.priority === 'critical' ? 'bg-red-50 border-red-400' :
                insight.priority === 'high' ? 'bg-orange-50 border-orange-400' :
                insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-800 text-sm">
                      {insight.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                      insight.type === 'crop' ? 'bg-green-100 text-green-700' :
                      insight.type === 'nutrient' ? 'bg-purple-100 text-purple-700' :
                      insight.type === 'pest' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {insight.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {cropHealthData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Health Score:</span>
            <span className="font-semibold text-gray-800">
              {cropHealthData.overallHealth.toFixed(1)}/10
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Growth Rate:</span>
            <span className={`font-semibold ${cropHealthData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cropHealthData.growthRate >= 0 ? '+' : ''}{cropHealthData.growthRate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}