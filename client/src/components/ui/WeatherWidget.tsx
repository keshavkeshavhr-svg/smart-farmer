import { useQuery } from '@tanstack/react-query';
import { Droplets, Wind, Sun, AlertTriangle, CloudRain, Thermometer, Calendar } from 'lucide-react';
import { api } from '../../lib/api';

type WeatherCurrent = { temp: number; feelsLike: number; description: string; humidity: number; windSpeed: number; icon: string };
type WeatherDay = { date: string; tempMax: number; tempMin: number; humidity: number; rainfallMm: number; rainProbability: number; description: string };
type WeatherData = { current: WeatherCurrent; forecast: WeatherDay[]; district: string; source: string };

function getCropAdvisory(weather: WeatherCurrent): string {
  if (weather.humidity > 80) return '⚠️ High humidity — watch for fungal diseases. Consider fungicide spray.';
  if (weather.temp > 38) return '🌡️ Very high temperature — increase irrigation frequency.';
  if (weather.description.toLowerCase().includes('rain')) return '🌧️ Rainfall expected — delay fertilizer application today.';
  if (weather.temp < 12) return '❄️ Cold weather — protect sensitive crops with covering.';
  return '✅ Good weather for field work. Ideal for irrigation and harvesting.';
}

export default function WeatherWidget({ district = 'Bangalore', state = 'Karnataka' }: { district?: string, state?: string }) {
  const { data: weather, isLoading, isError } = useQuery({
    queryKey: ['weather', { district, state }],
    queryFn: async () => {
      const res = await api.get('/weather', { params: { district, state } });
      return res as unknown as WeatherData;
    },
    retry: 2,
    refetchInterval: 30 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm animate-pulse h-32">
        <div className="h-4 bg-blue-200/50 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-blue-200/50 rounded w-1/2"></div>
      </div>
    );
  }

  const current = weather?.current;

  if (isError || !weather || !current) {
    return (
      <div className="bg-gradient-to-br from-gray-50 flex items-center gap-3 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm h-32">
        <AlertTriangle className="w-6 h-6 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-700">Weather Unavailable</p>
          <p className="text-xs text-gray-500">Could not load forecast for {district}.</p>
        </div>
      </div>
    );
  }

  const advisory = getCropAdvisory(current);
  const isRainy = current.description.toLowerCase().includes('rain') || current.description.toLowerCase().includes('cloud');

  return (
    <div className="rounded-xl border border-sky-100 shadow-sm overflow-hidden">
      {/* Main weather panel */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-8 opacity-10 transform rotate-12">
          {isRainy ? <CloudRain className="w-36 h-36 text-sky-400" /> : <Sun className="w-36 h-36 text-orange-400" />}
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-1">{weather.district}</p>
              <h3 className="text-5xl font-black text-sky-950">{Math.round(current.temp)}°C</h3>
              <p className="text-sm font-medium text-sky-700 mt-1 capitalize">{current.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-sky-600 font-medium">Feels like</p>
              <p className="text-xl font-bold text-sky-800">{Math.round(current.feelsLike)}°C</p>
            </div>
          </div>
          <div className="flex gap-6 mt-5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-800">
              <Droplets className="w-4 h-4 text-sky-500" /> {current.humidity}% Humidity
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-800">
              <Wind className="w-4 h-4 text-sky-500" /> {current.windSpeed} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Crop Advisory */}
      <div className="bg-amber-50 border-t border-amber-100 px-5 py-3">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5" /> Crop Advisory
        </p>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">{advisory}</p>
      </div>

      {/* 3-day Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="bg-white border-t border-gray-100 px-5 py-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> 3-Day Forecast
          </p>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.slice(0, 3).map((day, i) => (
              <div key={i} className="text-center bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-gray-500 mb-1">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                <p className="text-sm font-black text-gray-900">{day.tempMax}°</p>
                <p className="text-xs text-gray-400">{day.tempMin}°</p>
                {day.rainProbability > 20 && (
                  <p className="text-[9px] text-blue-500 font-bold mt-1">💧{day.rainProbability}%</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

