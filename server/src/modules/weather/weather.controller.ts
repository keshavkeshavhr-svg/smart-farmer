import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../../services/redis';
import { config } from '../../config';
import { logger } from '../../utils/logger';

// District to lat/lng lookup for Karnataka
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'hubli': { lat: 15.3647, lng: 75.1240 },
  'davangere': { lat: 14.4644, lng: 75.9218 },
  'belgaum': { lat: 15.8497, lng: 74.4977 },
  'mangalore': { lat: 12.8698, lng: 74.8422 },
  'shimoga': { lat: 13.9299, lng: 75.5681 },
  'tumkur': { lat: 13.3409, lng: 77.1011 },
  'hassan': { lat: 13.0070, lng: 76.1003 },
  'dharwad': { lat: 15.4589, lng: 75.0078 },
};

function getMockWeather(district: string) {
  const temp = 22 + Math.random() * 12;
  return {
    current: {
      temp: Math.round(temp), feelsLike: Math.round(temp - 2),
      humidity: Math.round(60 + Math.random() * 25),
      windSpeed: Math.round(5 + Math.random() * 15),
      description: ['Clear sky', 'Partly cloudy', 'Moderate rain', 'Light rain'][Math.floor(Math.random() * 4)],
      icon: '02d',
    },
    forecast: Array.from({ length: 3 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      tempMax: Math.round(temp + 2 + Math.random() * 4),
      tempMin: Math.round(temp - 4 + Math.random() * 3),
      humidity: Math.round(60 + Math.random() * 20),
      rainfallMm: Math.round(Math.random() * 15),
      rainProbability: Math.round(Math.random() * 70),
      description: ['Sunny', 'Cloudy', 'Light rain', 'Moderate rain', 'Thunderstorm'][Math.floor(Math.random() * 5)],
      icon: '03d',
    })),
    source: 'mock',
    district,
  };
}

export async function getWeather(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lng, district, state } = req.query as Record<string, string>;

    let latitude = parseFloat(lat);
    let longitude = parseFloat(lng);

    if ((!latitude || !longitude) && district) {
      const coords = DISTRICT_COORDS[district.toLowerCase()];
      if (coords) { latitude = coords.lat; longitude = coords.lng; }
    }

    if (!latitude || !longitude) {
      return res.json(getMockWeather(district || 'Bangalore'));
    }

    const cacheKey = `weather:${district || `${lat},${lng}`}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    if (!config.openWeather.apiKey) {
      const mock = getMockWeather(district || 'Unknown');
      await cacheSet(cacheKey, mock, 1800);
      return res.json(mock);
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${config.openWeather.apiKey}&units=metric&cnt=4`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!response.ok) {
      logger.warn({ data }, 'OpenWeatherMap API error, using mock');
      return res.json(getMockWeather(district || 'Unknown'));
    }

    const result = {
      current: {
        temp: Math.round(data.list[0].main.temp),
        feelsLike: Math.round(data.list[0].main.feels_like),
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed * 3.6),
        description: data.list[0].weather[0].description,
        icon: data.list[0].weather[0].icon,
      },
      forecast: data.list.slice(1, 4).map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        tempMax: Math.round(item.main.temp_max),
        tempMin: Math.round(item.main.temp_min),
        humidity: item.main.humidity,
        rainfallMm: Math.round((item.rain?.['3h'] || 0) * 8),
        rainProbability: Math.round(item.pop * 100),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })),
      source: 'openweathermap',
      district: district || `${latitude.toFixed(2)},${longitude.toFixed(2)}`,
    };

    await cacheSet(cacheKey, result, 1800);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
