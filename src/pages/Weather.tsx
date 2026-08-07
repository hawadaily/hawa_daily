import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, CloudLightning, Sun, CloudFog, Waves, Wind, Droplets, Thermometer, Moon, Sunrise, Sunset } from 'lucide-react';
import translations from '../data/translation.json';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
}

interface DhivehiCondition {
  location: string;
  temperature: number;
  condition: string;
}

interface DhivehiLabels {
  [key: string]: string;
}

interface CurrentWeather {
  temperature: number;
  condition: string;
  rainfall: number;
  wind: string;
  seaCondition: string;
  humidity: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  sunshine: string;
}

interface GeneralForecast {
  validPeriod: string;
  weather: string;
  winds: string;
  seas: string;
  waveHeight: string;
  advisory: string | null;
}

interface MarineForecast {
  validPeriod: string;
  weather: string;
  winds: string;
  seas: string;
  waveHeight: string;
}

interface PrecipitationImages {
  images: string[];
}

interface ExtendedForecast {
  day: string;
  temperature: number;
}

interface WeatherResponse {
  success: boolean;
  data: {
    current: CurrentWeather;
    locations: WeatherData[];
    extendedForecast: ExtendedForecast[];
    generalForecast: GeneralForecast;
    marineForecast: MarineForecast;
    precipitationImages: string[];
    dhivehiConditions: DhivehiCondition[];
    dhivehiLabels: DhivehiLabels;
  };
  lastUpdated: string;
}

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('thunder')) return CloudLightning;
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) return CloudRain;
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) return Cloud;
  if (conditionLower.includes('fine') || conditionLower.includes('clear') || conditionLower.includes('sunny')) return Sun;
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return CloudFog;
  return Cloud;
};

const getConditionColor = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('thunder')) return 'from-purple-500 to-indigo-600';
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) return 'from-blue-500 to-cyan-600';
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) return 'from-gray-500 to-gray-600';
  if (conditionLower.includes('fine') || conditionLower.includes('clear') || conditionLower.includes('sunny')) return 'from-yellow-400 to-orange-500';
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return 'from-gray-400 to-gray-500';
  return 'from-blue-400 to-blue-600';
};

const translate = (text: string, language: 'en' | 'dv', dhivehiLabels?: DhivehiLabels) => {
  // Weather page always stays in English
  return text;
};

const getDhivehiCondition = (location: string, conditions: DhivehiCondition[] | undefined, language: 'en' | 'dv') => {
  // Weather page always uses English
  return null;
};

export default function Weather() {
  const [language, setLanguage] = useState<'en' | 'dv'>('dv');
  const [weatherData, setWeatherData] = useState<{
    current: CurrentWeather;
    locations: WeatherData[];
    extendedForecast: ExtendedForecast[];
    generalForecast: GeneralForecast;
    marineForecast: MarineForecast;
    precipitationImages: string[];
    dhivehiConditions: DhivehiCondition[];
    dhivehiLabels: DhivehiLabels;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Sync with app language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'dv' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const originalDir = document.documentElement.dir;
    document.documentElement.dir = 'ltr';
    return () => {
      document.documentElement.dir = originalDir;
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/weather`);
      const data: WeatherResponse = await response.json();
      
      if (data.success) {
        setWeatherData(data.data);
        setLastUpdated(data.lastUpdated);
      } else {
        setError('Failed to fetch weather data');
      }
    } catch (err) {
      setError('Error connecting to weather service');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="ltr">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-2">މޫސުން</h1>
          <h2 className="text-2xl text-gray-600 mb-4">Weather Forecast</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center max-w-md mx-auto"
          >
            {error}
            <button
              onClick={fetchWeatherData}
              className="mt-2 text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Current Weather */}
        {!loading && !error && weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className={`bg-gradient-to-br ${getConditionColor(weatherData.current.condition)} p-8`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-bold mb-2">{translate('Malé', language, weatherData.dhivehiLabels)}</h2>
                  <p className="text-white/80 text-lg capitalize">{translate(weatherData.current.condition, language, weatherData.dhivehiLabels)}</p>
                </div>
                <div className="text-8xl text-white">
                  {(() => {
                    const Icon = getWeatherIcon(weatherData.current.condition);
                    return <Icon size={80} />;
                  })()}
                </div>
              </div>
              <div className="text-white text-7xl font-bold mt-4">{weatherData.current.temperature}°C</div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center flex flex-col items-center">
                <Droplets className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Rainfall', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.rainfall} mm</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Wind className="w-6 h-6 text-gray-500 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Wind', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.wind}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Droplets className="w-6 h-6 text-cyan-500 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Humidity', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.humidity}%</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Waves className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Sea', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.seaCondition}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Sunrise className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Sunrise/Sunset', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.sunrise} / {weatherData.current.sunset}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Sun className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Sunshine', language, weatherData.dhivehiLabels)}</p>
                <p className="text-2xl font-bold text-gray-800">{weatherData.current.sunshine}</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 border-t border-gray-100">
              <div className="text-center flex flex-col items-center">
                <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Moonrise', language, weatherData.dhivehiLabels)}</p>
                <p className="text-xl font-bold text-gray-800">{weatherData.current.moonrise}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Moon className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">{translate('Moonset', language, weatherData.dhivehiLabels)}</p>
                <p className="text-xl font-bold text-gray-800">{weatherData.current.moonset}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Extended Forecast */}
        {!loading && !error && weatherData && weatherData.extendedForecast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{translate('Extended Forecast', language, weatherData.dhivehiLabels)}</h3>
            <div className="grid grid-cols-5 gap-4">
              {weatherData.extendedForecast.map((forecast, index) => (
                <motion.div
                  key={forecast.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center p-4 bg-blue-50 rounded-xl"
                >
                  <p className="text-gray-600 font-semibold">{translate(forecast.day, language, weatherData.dhivehiLabels)}</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{forecast.temperature}°C</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* General Forecast */}
        {!loading && !error && weatherData && weatherData.generalForecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{translate('General Forecast', language, weatherData.dhivehiLabels)}</h3>
            <p className="text-sm text-gray-500 mb-4">{weatherData.generalForecast.validPeriod}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Weather', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.generalForecast.weather}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Winds', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.generalForecast.winds}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Seas', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.generalForecast.seas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Wave Height', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.generalForecast.waveHeight}</p>
              </div>
            </div>
            {weatherData.generalForecast.advisory && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <p className="text-yellow-800 font-semibold">⚠️ {translate('Advisory', language, weatherData.dhivehiLabels)}</p>
                <p className="text-yellow-700">{weatherData.generalForecast.advisory}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Marine Forecast */}
        {!loading && !error && weatherData && weatherData.marineForecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{translate('Marine Forecast', language, weatherData.dhivehiLabels)}</h3>
            <p className="text-sm text-gray-500 mb-4">{weatherData.marineForecast.validPeriod}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Weather', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.marineForecast.weather}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Winds', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.marineForecast.winds}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Seas', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.marineForecast.seas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">{translate('Wave Height', language, weatherData.dhivehiLabels)}</p>
                <p className="text-gray-800 font-semibold">{weatherData.marineForecast.waveHeight}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Precipitation Forecast */}
        {!loading && !error && weatherData && weatherData.precipitationImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{translate('Precipitation Forecast', language, weatherData.dhivehiLabels)}</h3>
            <div id="carouselExampleFade" className="carousel slide carousel-fade moon-outer relative">
              <div className="carousel-inner relative overflow-hidden rounded-xl">
                {weatherData.precipitationImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-600 ease-in-out`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Precipitation forecast ${index + 1}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              {weatherData.precipitationImages.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev absolute top-0 left-0 bottom-0 flex items-center justify-center w-1/4 cursor-pointer z-10"
                    onClick={() => {
                      const carousel = document.getElementById('carouselExampleFade');
                      const activeItem = carousel?.querySelector('.carousel-item.active');
                      const prevItem = activeItem?.previousElementSibling || carousel?.querySelector('.carousel-item:last-child');
                      if (activeItem && prevItem) {
                        activeItem.classList.remove('active');
                        prevItem.classList.add('active');
                      }
                    }}
                  >
                    <span className="carousel-control-prev-icon inline-block w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
                      ‹
                    </span>
                  </button>
                  <button
                    className="carousel-control-next absolute top-0 right-0 bottom-0 flex items-center justify-center w-1/4 cursor-pointer z-10"
                    onClick={() => {
                      const carousel = document.getElementById('carouselExampleFade');
                      const activeItem = carousel?.querySelector('.carousel-item.active');
                      const nextItem = activeItem?.nextElementSibling || carousel?.querySelector('.carousel-item:first-child');
                      if (activeItem && nextItem) {
                        activeItem.classList.remove('active');
                        nextItem.classList.add('active');
                      }
                    }}
                  >
                    <span className="carousel-control-next-icon inline-block w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
                      ›
                    </span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Location Weather Cards */}
        {!loading && !error && weatherData && weatherData.locations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          >
            {weatherData.locations.map((weather, index) => (
              <motion.div
                key={weather.location}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`bg-gradient-to-br ${getConditionColor(weather.condition)} p-6`}>
                  <div className="text-6xl mb-2 text-white">
                    {(() => {
                      const Icon = getWeatherIcon(weather.condition);
                      return <Icon size={48} />;
                    })()}
                  </div>
                  <div className="text-white text-5xl font-bold">{weather.temperature}°C</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{translate(weather.location, language, weatherData.dhivehiLabels)}</h3>
                  <p className="text-gray-600 capitalize">
                    {getDhivehiCondition(weather.location, weatherData.dhivehiConditions, language) || translate(weather.condition, language)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Data State */}
        {!loading && !error && !weatherData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-600 text-lg">No weather data available at the moment.</p>
            <button
              onClick={fetchWeatherData}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>Data source: Maldives Meteorological Service</p>
          <a
            href="https://www.meteorology.gov.mv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            www.meteorology.gov.mv
          </a>
        </motion.div>
      </div>
    </div>
  );
}
