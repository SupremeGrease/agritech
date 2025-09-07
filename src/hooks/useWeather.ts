import { useState, useEffect, useCallback } from 'react';
import { getCurrentWeather, fetchWeatherByLocation, fetchWeatherByCity } from '../services/weather.service';

export interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface WeatherData {
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

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchWeather = useCallback(async (locationData?: LocationData) => {
    try {
      setLoading(true);
      setError(null);
      
      let weatherData: WeatherData;
      
      if (locationData) {
        weatherData = await fetchWeatherByLocation(locationData);
      } else {
        weatherData = await getCurrentWeather();
      }
      
      setWeather(weatherData);
      setLocation({
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        city: weatherData.name,
        country: weatherData.sys.country
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      setError(null);
      
      const weatherData = await getCurrentWeather();
      setWeather(weatherData);
      setLocation({
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        city: weatherData.name,
        country: weatherData.sys.country
      });
    } catch (err) {
      console.error('Error detecting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect location');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const searchLocation = useCallback(async (cityName: string) => {
    try {
      setLocationLoading(true);
      setError(null);
      
      const weatherData = await fetchWeatherByCity(cityName);
      setWeather(weatherData);
      setLocation({
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        city: weatherData.name,
        country: weatherData.sys.country
      });
    } catch (err) {
      console.error('Error searching location:', err);
      setError(err instanceof Error ? err.message : 'Failed to search location');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return {
    weather,
    loading,
    error,
    location,
    setLocation,
    detectLocation,
    searchLocation,
    locationLoading,
    refreshWeather: () => fetchWeather(location || undefined)
  };
}
