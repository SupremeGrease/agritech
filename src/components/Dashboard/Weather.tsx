import { useWeather } from '../../hooks/useWeather';
import LocationSelector from '../weather/LocationSelector';
import { formatLocationName } from '../../services/weather.service';

export default function Weather() {
  const { weather, loading, error, location, setLocation, detectLocation, searchLocation, locationLoading } = useWeather();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Weather Data</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold">No Weather Data</h3>
          <p className="text-yellow-600 mt-1">Unable to fetch weather information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Weather</h2>
        <LocationSelector
          selectedLocation={location}
          onLocationChange={setLocation}
          onDetectLocation={detectLocation}
          onSearchLocation={searchLocation}
          locationLoading={locationLoading}
          className="w-48"
        />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {weather.name}, {weather.sys.country}
            <span className="text-sm text-gray-500 ml-2">
              ({formatLocationName(location)})
            </span>
          </h3>
          <p className="text-gray-600">
            {weather.weather[0].description.charAt(0).toUpperCase() +
              weather.weather[0].description.slice(1)}
          </p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
          className="w-16 h-16"
        />
      </div>
      
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-gray-800">
          {Math.round(weather.main.temp)}°C
        </p>
        <p className="text-gray-600">
          Feels like: {Math.round(weather.main.feels_like)}°C
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Humidity</div>
          <div className="font-semibold">{weather.main.humidity}%</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Wind Speed</div>
          <div className="font-semibold">{weather.wind.speed} m/s</div>
        </div>
      </div>
    </div>
  );
}
