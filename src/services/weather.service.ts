interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    description: string;
    main: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

const OPENWEATHER_API_KEY = '0f5a2eb7ee228e0d0cc4b7bd3426a17e';

export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported, using fallback location');
      resolve({
        lat: 28.6139,
        lon: 77.2090,
        city: 'Delhi',
        country: 'IN'
      });
      return;
    }

    console.log('📍 Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Location obtained:', { latitude, longitude });
        
        try {
          // Get city name from coordinates using reverse geocoding
          const cityResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
          );
          const cityData = await cityResponse.json();
          console.log('🏙️ Reverse geocoding result:', cityData[0]);
          
          resolve({
            lat: latitude,
            lon: longitude,
            city: cityData[0]?.name || 'Current Location',
            country: cityData[0]?.country || 'Unknown'
          });
        } catch (error) {
          console.warn('⚠️ Reverse geocoding failed:', error);
          // If reverse geocoding fails, still return coordinates
          resolve({
            lat: latitude,
            lon: longitude,
            city: 'Current Location',
            country: 'Unknown'
          });
        }
      },
      (error) => {
        console.warn('⚠️ Location access denied or failed:', error.message);
        // Fallback to a default location (Delhi, India)
        resolve({
          lat: 28.6139,
          lon: 77.2090,
          city: 'Delhi',
          country: 'IN'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 0 // Don't use cached location
      }
    );
  });
}

export async function fetchWeatherByLocation(location: LocationData): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    console.log('🌤️ Getting current location...');
    const location = await getCurrentLocation();
    console.log('🌤️ Location obtained:', location);
    
    console.log('🌤️ Fetching weather for location...');
    const weather = await fetchWeatherByLocation(location);
    console.log('🌤️ Weather fetched successfully:', {
      city: weather.name,
      country: weather.sys.country,
      temp: weather.main.temp
    });
    
    return weather;
  } catch (error) {
    console.error('❌ Error getting current weather:', error);
    console.log('🌤️ Falling back to Delhi weather...');
    // Fallback to Delhi weather
    return await fetchWeatherByCity('Delhi');
  }
}

export function formatLocationName(location: LocationData | null): string {
  if (!location) return 'Unknown Location';
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`;
}
