// Enhanced Crop Health Service with proper bounds and optimal ranges
export interface NutrientData {
    nitrogen: number;    // % (0-5)
    phosphorus: number;  // % (0-2)
    potassium: number;   // % (0-3)
    ph: number;         // pH (4-10)
  }
  
  export interface WeatherData {
    temperature: number;  // °C (-10 to 50)
    humidity: number;     // % (0-100)
    rainfall: number;     // mm (0-500)
    windSpeed: number;    // m/s (0-30)
  }
  
  export interface CropData {
    height: number;       // cm (0-200)
    lai: number;         // Leaf Area Index (0-8)
    tacScore: number;    // Total Antioxidant Capacity (0-100)
  }
  
  export interface HealthIssue {
    type: 'disease' | 'pest' | 'nutrient' | 'environmental';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number; // 0-10
  }
  
  export interface CropHealthData {
    overallHealth: number;  // 0-1 (will be displayed as 0-100%)
    growthRate: number;     // percentage change
    issues: HealthIssue[];
    recommendations: string[];
    details: {
      nutrientScore: number;
      growthScore: number;
      environmentalScore: number;
      diseaseScore: number;
    };
  }
  
  // Optimal ranges for wheat crops based on agricultural research
  const WHEAT_OPTIMAL_RANGES = {
    nitrogen: { min: 2.0, optimal: 2.8, max: 4.0 },      // % dry weight
    phosphorus: { min: 0.3, optimal: 0.8, max: 1.2 },   // % dry weight
    potassium: { min: 1.0, optimal: 1.6, max: 2.5 },    // % dry weight
    ph: { min: 6.0, optimal: 7.0, max: 8.0 },           // pH units
    height: { min: 60, optimal: 100, max: 120 },         // cm
    lai: { min: 2.0, optimal: 4.0, max: 6.0 },          // index
    tacScore: { min: 70, optimal: 100, max: 100 },       // score
    temperature: { min: 15, optimal: 22, max: 30 },      // °C
    humidity: { min: 40, optimal: 65, max: 80 },         // %
    rainfall: { min: 20, optimal: 50, max: 100 }         // mm/month
  };
  
  // Utility function to clamp values within bounds
  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
  
  // Calculate nutrient efficiency score (0-1) based on optimal ranges
  function calculateNutrientEfficiency(value: number, range: { min: number; optimal: number; max: number }): number {
    // Clamp the input value to realistic bounds
    const clampedValue = clamp(value, 0, range.max * 2); // Allow up to 2x max for toxicity calculation
    
    if (clampedValue < range.min) {
      // Deficient range - linear decrease
      return clampedValue / range.min * 0.3; // Max 30% efficiency when deficient
    } else if (clampedValue <= range.optimal) {
      // Building up to optimal - linear increase
      return 0.3 + (clampedValue - range.min) / (range.optimal - range.min) * 0.7;
    } else if (clampedValue <= range.max) {
      // Optimal to maximum - slight decrease
      return 1.0 - (clampedValue - range.optimal) / (range.max - range.optimal) * 0.2;
    } else {
      // Toxic range - significant decrease
      const excessRatio = (clampedValue - range.max) / range.max;
      return Math.max(0.1, 0.8 - excessRatio * 0.7); // Minimum 10% efficiency
    }
  }
  
  // Calculate environmental score based on weather conditions
  function calculateEnvironmentalScore(weather: WeatherData): number {
    const tempScore = calculateNutrientEfficiency(weather.temperature, WHEAT_OPTIMAL_RANGES.temperature);
    const humidityScore = calculateNutrientEfficiency(weather.humidity, WHEAT_OPTIMAL_RANGES.humidity);
    const rainfallScore = calculateNutrientEfficiency(weather.rainfall, WHEAT_OPTIMAL_RANGES.rainfall);
    
    // Wind speed - simple linear decrease after optimal (5 m/s)
    const windScore = weather.windSpeed <= 5 ? 1.0 : Math.max(0.2, 1.0 - (weather.windSpeed - 5) / 15);
    
    return (tempScore + humidityScore + rainfallScore + windScore) / 4;
  }
  
  // Generate health issues based on current conditions
  function generateHealthIssues(nutrients: NutrientData, weather: WeatherData, crop: CropData): HealthIssue[] {
    const issues: HealthIssue[] = [];
    
    // Nutrient-related issues
    if (nutrients.nitrogen < WHEAT_OPTIMAL_RANGES.nitrogen.min) {
      issues.push({
        type: 'nutrient',
        severity: nutrients.nitrogen < WHEAT_OPTIMAL_RANGES.nitrogen.min * 0.7 ? 'critical' : 'high',
        description: 'Nitrogen deficiency detected - yellowing leaves expected',
        impact: clamp(Math.round((WHEAT_OPTIMAL_RANGES.nitrogen.min - nutrients.nitrogen) * 3), 1, 10)
      });
    } else if (nutrients.nitrogen > WHEAT_OPTIMAL_RANGES.nitrogen.max) {
      issues.push({
        type: 'nutrient',
        severity: nutrients.nitrogen > WHEAT_OPTIMAL_RANGES.nitrogen.max * 1.5 ? 'critical' : 'medium',
        description: 'Excess nitrogen - increased disease susceptibility',
        impact: clamp(Math.round((nutrients.nitrogen - WHEAT_OPTIMAL_RANGES.nitrogen.max) * 2), 1, 10)
      });
    }
    
    if (nutrients.phosphorus < WHEAT_OPTIMAL_RANGES.phosphorus.min) {
      issues.push({
        type: 'nutrient',
        severity: nutrients.phosphorus < WHEAT_OPTIMAL_RANGES.phosphorus.min * 0.6 ? 'critical' : 'high',
        description: 'Phosphorus deficiency - poor root development',
        impact: clamp(Math.round((WHEAT_OPTIMAL_RANGES.phosphorus.min - nutrients.phosphorus) * 8), 1, 10)
      });
    }
    
    if (nutrients.potassium < WHEAT_OPTIMAL_RANGES.potassium.min) {
      issues.push({
        type: 'nutrient',
        severity: nutrients.potassium < WHEAT_OPTIMAL_RANGES.potassium.min * 0.5 ? 'critical' : 'medium',
        description: 'Potassium deficiency - reduced disease resistance',
        impact: clamp(Math.round((WHEAT_OPTIMAL_RANGES.potassium.min - nutrients.potassium) * 5), 1, 10)
      });
    } else if (nutrients.potassium > WHEAT_OPTIMAL_RANGES.potassium.max) {
      issues.push({
        type: 'nutrient',
        severity: 'low',
        description: 'Excess potassium - may inhibit calcium uptake',
        impact: clamp(Math.round((nutrients.potassium - WHEAT_OPTIMAL_RANGES.potassium.max) * 2), 1, 5)
      });
    }
    
    // pH issues
    if (nutrients.ph < WHEAT_OPTIMAL_RANGES.ph.min || nutrients.ph > WHEAT_OPTIMAL_RANGES.ph.max) {
      issues.push({
        type: 'environmental',
        severity: (nutrients.ph < 5.5 || nutrients.ph > 8.5) ? 'critical' : 'medium',
        description: `Soil pH ${nutrients.ph.toFixed(1)} is outside optimal range (${WHEAT_OPTIMAL_RANGES.ph.min}-${WHEAT_OPTIMAL_RANGES.ph.max})`,
        impact: clamp(Math.round(Math.abs(nutrients.ph - WHEAT_OPTIMAL_RANGES.ph.optimal) * 2), 1, 8)
      });
    }
    
    // Environmental issues
    if (weather.temperature > WHEAT_OPTIMAL_RANGES.temperature.max) {
      issues.push({
        type: 'environmental',
        severity: weather.temperature > 35 ? 'critical' : 'high',
        description: 'High temperature stress - may reduce grain filling',
        impact: clamp(Math.round((weather.temperature - WHEAT_OPTIMAL_RANGES.temperature.max) * 0.8), 1, 10)
      });
    }
    
    if (weather.humidity > WHEAT_OPTIMAL_RANGES.humidity.max) {
      issues.push({
        type: 'disease',
        severity: weather.humidity > 90 ? 'high' : 'medium',
        description: 'High humidity increases fungal disease risk',
        impact: clamp(Math.round((weather.humidity - WHEAT_OPTIMAL_RANGES.humidity.max) * 0.2), 1, 6)
      });
    }
    
    return issues;
  }
  
  // Generate recommendations based on issues and conditions
  function generateRecommendations(issues: HealthIssue[], nutrients: NutrientData, weather: WeatherData): string[] {
    const recommendations: string[] = [];
    
    // Nutrient recommendations
    if (nutrients.nitrogen < WHEAT_OPTIMAL_RANGES.nitrogen.min) {
      recommendations.push('Apply nitrogen fertilizer (urea or ammonium sulfate)');
    } else if (nutrients.nitrogen > WHEAT_OPTIMAL_RANGES.nitrogen.max) {
      recommendations.push('Reduce nitrogen application and monitor for disease');
    }
    
    if (nutrients.phosphorus < WHEAT_OPTIMAL_RANGES.phosphorus.min) {
      recommendations.push('Apply phosphorus fertilizer (DAP or triple superphosphate)');
    }
    
    if (nutrients.potassium < WHEAT_OPTIMAL_RANGES.potassium.min) {
      recommendations.push('Apply potassium fertilizer (muriate of potash)');
    }
    
    // pH recommendations
    if (nutrients.ph < WHEAT_OPTIMAL_RANGES.ph.min) {
      recommendations.push('Apply lime to increase soil pH');
    } else if (nutrients.ph > WHEAT_OPTIMAL_RANGES.ph.max) {
      recommendations.push('Apply sulfur or organic matter to reduce pH');
    }
    
    // Weather-based recommendations
    if (weather.temperature > WHEAT_OPTIMAL_RANGES.temperature.max) {
      recommendations.push('Increase irrigation frequency during heat stress');
    }
    
    if (weather.humidity > WHEAT_OPTIMAL_RANGES.humidity.max) {
      recommendations.push('Monitor for fungal diseases and apply preventive fungicides');
    }
    
    // Critical issue recommendations
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical issues immediately to prevent yield loss');
    }
    
    return recommendations;
  }
  
  // Main function to calculate crop health
  export function calculateCropHealth(
    nutrients: NutrientData,
    weather: WeatherData,
    crop?: CropData
  ): CropHealthData {
    // Use default crop data if not provided
    const defaultCrop: CropData = {
      height: 80,
      lai: 3.2,
      tacScore: 85
    };
    
    const cropData = crop || defaultCrop;
    
    // Calculate individual scores (0-1)
    const nutrientScore = (
      calculateNutrientEfficiency(nutrients.nitrogen, WHEAT_OPTIMAL_RANGES.nitrogen) +
      calculateNutrientEfficiency(nutrients.phosphorus, WHEAT_OPTIMAL_RANGES.phosphorus) +
      calculateNutrientEfficiency(nutrients.potassium, WHEAT_OPTIMAL_RANGES.potassium) +
      calculateNutrientEfficiency(nutrients.ph, WHEAT_OPTIMAL_RANGES.ph)
    ) / 4;
    
    const growthScore = (
      calculateNutrientEfficiency(cropData.height, WHEAT_OPTIMAL_RANGES.height) +
      calculateNutrientEfficiency(cropData.lai, WHEAT_OPTIMAL_RANGES.lai) +
      calculateNutrientEfficiency(cropData.tacScore, WHEAT_OPTIMAL_RANGES.tacScore)
    ) / 3;
    
    const environmentalScore = calculateEnvironmentalScore(weather);
    
    // Generate health issues
    const issues = generateHealthIssues(nutrients, weather, cropData);
    
    // Calculate disease score based on issues
    const diseaseImpact = issues.reduce((total, issue) => {
      const severityWeight = {
        'low': 0.1,
        'medium': 0.3,
        'high': 0.6,
        'critical': 1.0
      };
      return total + (issue.impact * severityWeight[issue.severity]);
    }, 0);
    
    const diseaseScore = Math.max(0.1, 1 - (diseaseImpact / 50)); // Normalize to 0.1-1.0
    
    // Calculate overall health with weighted average
    const overallHealth = clamp(
      (nutrientScore * 0.35 + growthScore * 0.25 + environmentalScore * 0.25 + diseaseScore * 0.15),
      0,
      1
    );
    
    // Calculate growth rate based on current conditions
    const idealConditions = 0.85; // 85% is considered ideal baseline
    const growthRate = clamp((overallHealth - idealConditions) * 50, -25, 25);
    
    return {
      overallHealth,
      growthRate,
      issues,
      recommendations: generateRecommendations(issues, nutrients, weather),
      details: {
        nutrientScore: Math.round(nutrientScore * 100),
        growthScore: Math.round(growthScore * 100),
        environmentalScore: Math.round(environmentalScore * 100),
        diseaseScore: Math.round(diseaseScore * 100)
      }
    };
  }
  
  // Default data generators with proper bounds
  export function getDefaultNutrients(): NutrientData {
    return {
      nitrogen: 2.2,    // Slightly below optimal
      phosphorus: 0.6,  // Slightly below optimal  
      potassium: 2.0,   // Above optimal (your 70% potassium issue)
      ph: 6.8          // Near optimal
    };
  }
  
  export function getDefaultWeather(): WeatherData {
    return {
      temperature: 26,  // Within optimal range
      humidity: 70,     // Near optimal
      rainfall: 45,     // Good range
      windSpeed: 3.5    // Optimal
    };
  }
  
  export function getDefaultCrop(): CropData {
    return {
      height: 80,       // Below optimal
      lai: 3.2,         // Below optimal
      tacScore: 85      // Good
    };
  }
  
  // Test data generators for different scenarios
  export function getTestNutrientsOptimal(): NutrientData {
    return {
      nitrogen: 2.8,    // Optimal
      phosphorus: 0.8,  // Optimal  
      potassium: 1.6,   // Optimal
      ph: 7.0          // Optimal
    };
  }
  
  export function getTestNutrientsDeficient(): NutrientData {
    return {
      nitrogen: 1.5,    // Deficient
      phosphorus: 0.2,  // Deficient
      potassium: 0.8,   // Deficient
      ph: 5.5          // Too acidic
    };
  }
  
  export function getTestNutrientsExcess(): NutrientData {
    return {
      nitrogen: 4.5,    // Excess (toxic)
      phosphorus: 1.5,  // Excess
      potassium: 3.0,   // Excess (your 70% potassium issue)
      ph: 8.5          // Too alkaline
    };
  }
  
  export function getTestWeatherStress(): WeatherData {
    return {
      temperature: 35,  // Heat stress
      humidity: 95,     // Too humid (disease risk)
      rainfall: 150,    // Too much rain
      windSpeed: 20     // High wind stress
    };
  }
  
  export function getTestWeatherOptimal(): WeatherData {
    return {
      temperature: 22,  // Optimal
      humidity: 65,     // Optimal
      rainfall: 50,     // Optimal
      windSpeed: 5      // Optimal
    };
  }
  
  export function getTestNutrientsHighPotassium(): NutrientData {
    return {
      nitrogen: 2.2,    // Slightly below optimal
      phosphorus: 0.6,  // Slightly below optimal
      potassium: 7.0,   // Very high (70% - your specific issue!)
      ph: 6.8          // Near optimal
    };
  }
  
  export function getTestNutrientsHighNitrogen(): NutrientData {
    return {
      nitrogen: 5.0,    // Very high
      phosphorus: 0.8,  // Optimal
      potassium: 1.6,   // Optimal
      ph: 7.0          // Optimal
    };
  }
  
  export function getTestNutrientsHighPhosphorus(): NutrientData {
    return {
      nitrogen: 2.8,    // Optimal
      phosphorus: 2.0,  // Very high
      potassium: 1.6,   // Optimal
      ph: 7.0          // Optimal
    };
  }