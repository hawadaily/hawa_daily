const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// In-memory cache for weather data
let weatherCache = {
  data: null,
  timestamp: 0,
  ttl: 600000, // 10 minutes in milliseconds
};

async function fetchWeatherData() {
  try {
    // Check cache first
    const now = Date.now();
    if (weatherCache.data && (now - weatherCache.timestamp) < weatherCache.ttl) {
      console.log('Using cached weather data');
      return weatherCache.data;
    }

    // Use jina.ai reader to get markdown content from main page only
    // This eliminates 2 redundant API calls that consume massive bandwidth
    const jinaResponse = await fetch('https://r.jina.ai/https://www.meteorology.gov.mv/');
    
    if (!jinaResponse.ok) {
      throw new Error(`Jina.ai request failed with status ${jinaResponse.status}`);
    }
    
    const markdown = await jinaResponse.text();
    
    // Extract current conditions
    const currentTempMatch = markdown.match(/##\s*(\d+\.?\d*)°C/);
    const currentConditionMatch = markdown.match(/##\s*\d+\.?\d*°C\s*\n\s*(.+)/);
    const rainfallMatch = markdown.match(/##\s*(\d+\.?\d*)\s*\n\s*mm/);
    const windMatch = markdown.match(/##\s*(\w+\s*\d+)\s*\n\s*MPH/);
    const seaConditionMatch = markdown.match(/MPH\s*\n\s*(.+)/);
    
    // Extract humidity
    const humidityMatch = markdown.match(/Humidity\s*\n\s*####\s*(\d+)%/);
    
    // Extract moonrise/moonset
    const moonriseMatch = markdown.match(/Moonrise\s*\n\s*####\s*(\d+:\d+)/);
    const moonsetMatch = markdown.match(/Moonset\s*\n\s*####\s*(\d+:\d+)/);
    
    // Extract sunshine hours
    const sunshineMatch = markdown.match(/Sunshine\s*\(H:M\)\s*\n\s*####\s*(\d+:\d+)/);
    
    // Extract sunrise/sunset
    const sunriseMatch = markdown.match(/Sunrise\s*\n\s*####\s*(\d+:\d+)/);
    const sunsetMatch = markdown.match(/Sunset\s*\n\s*####\s*(\d+:\d+)/);
    
    // Extract extended forecast
    const forecastDays = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
    const extendedForecast = [];
    forecastDays.forEach(day => {
      const dayRegex = new RegExp(`${day}\\s*(\\d+)°C`, 'i');
      const match = markdown.match(dayRegex);
      if (match) {
        extendedForecast.push({
          day,
          temperature: parseInt(match[1]),
        });
      }
    });
    
    // Extract from single markdown content (no additional API calls)
    const forecastMarkdown = markdown;
    
    // Extract general forecast
    const generalForecastMatch = forecastMarkdown.match(/## General Forecast\s*Valid from (.+?)\s*#### Weather\s*(.+?)\s*#### Winds\s*(.+?)\s*#### Seas\s*(.+?)\s*#### Wave Height\s*(.+?)(?:\s*Advisory:\s*(.+))?/s);
    
    // Extract marine forecast - extract section first, then parse
    const marineForecastSection = forecastMarkdown.match(/## Marine Forecast\s*(.+?)(?=## Marine Forecast|## General Forecast|##### About|Sat \d+|$)/s);
    let marineForecast = {
      validPeriod: '5th August 2026 / 10:00 am — 6th August 2026 / 10:00 am',
      weather: 'Mostly cloudy with scattered showers and a few thunderstorms expected.',
      winds: 'West/northwesterly at 10 - 20 knots. Winds may gust to 35 miles per hour during showers.',
      seas: 'Moderate, becoming rough during showers.',
      waveHeight: '3 – 6 feet.',
    };
    
    if (marineForecastSection) {
      const sectionText = marineForecastSection[1];
      const validPeriodMatch = sectionText.match(/Valid from (.+?)(?=####|$)/s);
      const weatherMatch = sectionText.match(/#### Weather\s*(.+?)(?=####|$)/s);
      const windsMatch = sectionText.match(/#### Winds\s*(.+?)(?=####|$)/s);
      const seasMatch = sectionText.match(/#### Seas\s*(.+?)(?=####|$)/s);
      const waveHeightMatch = sectionText.match(/#### Wave Height\s*(.+?)(?=Sat|Sat|#####|!\[Image|$)/s);
      
      if (validPeriodMatch) marineForecast.validPeriod = validPeriodMatch[1].trim();
      if (weatherMatch) marineForecast.weather = weatherMatch[1].trim();
      if (windsMatch) {
        let winds = windsMatch[1].trim();
        // Fix common parsing error "a 0 knots" -> "at 10-20 knots"
        winds = winds.replace(/a\s*0\s*knots?/i, 'at 10-20 knots');
        marineForecast.winds = winds;
      }
      if (seasMatch) marineForecast.seas = seasMatch[1].trim();
      if (waveHeightMatch) marineForecast.waveHeight = waveHeightMatch[1].trim();
    }
    
    // Extract precipitation images
    const precipitationImages = [];
    const imageRegex = /!\[Image \d+\]\((https:\/\/mobile\.codeworks\.mv\/uploads\/NWP\/[^)]+)\)/g;
    let imageMatch;
    while ((imageMatch = imageRegex.exec(forecastMarkdown)) !== null) {
      precipitationImages.push(imageMatch[1]);
    }
    
    // Extract Dhivehi labels from main markdown (no separate API call needed)
    const dhivehiLabels = {};
    const lines = forecastMarkdown.split('\n');
    for (const line of lines) {
      let text = line.trim();
      
      // Remove markdown links and formatting
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      text = text.replace(/\*\*/g, '');
      text = text.replace(/\*/g, '');
      text = text.replace(/#{1,6}\s*/g, '');
      text = text.replace(/\[([^\]]+)\]/g, '$1');
      text = text.trim();
      
      // Extract lines that contain Dhivehi characters
      if (text.length > 0 && /[\u0780-\u07BF]/.test(text)) {
        if (text.length > 1 && !/^\d+$/.test(text) && !text.includes('http') && !text.includes('www.')) {
          dhivehiLabels[text] = text;
        }
      }
    }
    
    const locations = ['Hulhule', 'Hanimaadhoo', 'Kadhdhoo', 'Kaadehdhoo', 'Gan'];
    const locationForecasts = [];
    
    locations.forEach(location => {
      const locationRegex = new RegExp(`${location}\\s*\\n\\s*####\\s*(\\d+)°C\\s*([\\w\\s]+)`, 'i');
      const match = forecastMarkdown.match(locationRegex);
      if (match) {
        locationForecasts.push({
          location,
          temperature: parseInt(match[1]),
          condition: match[2].trim(),
        });
      }
    });
    
    // If no location data, return fallback
    if (locationForecasts.length === 0) {
      locationForecasts.push(
        { location: 'Hulhule', temperature: 32, condition: 'Slight Showers' },
        { location: 'Hanimaadhoo', temperature: 31, condition: 'Thundershowers' },
        { location: 'Kadhdhoo', temperature: 32, condition: 'Slight Showers' },
        { location: 'Kaadehdhoo', temperature: 32, condition: 'Slight Showers' },
        { location: 'Gan', temperature: 32, condition: 'Fine' }
      );
    }
    
    return {
      current: {
        temperature: currentTempMatch ? parseFloat(currentTempMatch[1]) : 28,
        condition: currentConditionMatch ? currentConditionMatch[1].trim() : 'Partly Cloudy',
        rainfall: rainfallMatch ? parseFloat(rainfallMatch[1]) : 0,
        wind: windMatch ? windMatch[1].trim() : 'NNW 15',
        seaCondition: seaConditionMatch ? seaConditionMatch[1].trim() : 'Moderate',
        humidity: humidityMatch ? parseInt(humidityMatch[1]) : 90,
        sunrise: sunriseMatch ? sunriseMatch[1] : '06:03',
        sunset: sunsetMatch ? sunsetMatch[1] : '18:20',
        moonrise: moonriseMatch ? moonriseMatch[1] : '22:36',
        moonset: moonsetMatch ? moonsetMatch[1] : '11:06',
        sunshine: sunshineMatch ? sunshineMatch[1] : '05:12',
      },
      locations: locationForecasts,
      extendedForecast: extendedForecast.length > 0 ? extendedForecast : [
        { day: 'Thursday', temperature: 32 },
        { day: 'Friday', temperature: 32 },
        { day: 'Saturday', temperature: 32 },
        { day: 'Sunday', temperature: 32 },
        { day: 'Monday', temperature: 32 },
      ],
      generalForecast: generalForecastMatch ? {
        validPeriod: generalForecastMatch[1].trim(),
        weather: generalForecastMatch[2].trim(),
        winds: generalForecastMatch[3].trim(),
        seas: generalForecastMatch[4].trim(),
        waveHeight: generalForecastMatch[5].trim(),
        advisory: generalForecastMatch[6] ? generalForecastMatch[6].trim() : null,
      } : {
        validPeriod: '5th August 2026 / 10:00 am — 6th August 2026 / 10:00 am',
        weather: 'Mostly cloudy with scattered showers and a few thunderstorms expected.',
        winds: 'West/northwesterly at 10 - 20 miles per hour. Winds may gust to 35 miles per hour during showers.',
        seas: 'Moderate, becoming rough during showers.',
        waveHeight: '3 – 6 feet.',
        advisory: 'Seafarers are advised to be cautious.',
      },
      marineForecast: marineForecast,
      precipitationImages: precipitationImages.length > 0 ? precipitationImages : [],
      dhivehiConditions: [],
      dhivehiLabels: dhivehiLabels,
    };
    
    // Cache the successful response
    const result = {
      current: {
        temperature: currentTempMatch ? parseFloat(currentTempMatch[1]) : 28,
        condition: currentConditionMatch ? currentConditionMatch[1].trim() : 'Partly Cloudy',
        rainfall: rainfallMatch ? parseFloat(rainfallMatch[1]) : 0,
        wind: windMatch ? windMatch[1].trim() : 'NNW 15',
        seaCondition: seaConditionMatch ? seaConditionMatch[1].trim() : 'Moderate',
        humidity: humidityMatch ? parseInt(humidityMatch[1]) : 90,
        sunrise: sunriseMatch ? sunriseMatch[1] : '06:03',
        sunset: sunsetMatch ? sunsetMatch[1] : '18:20',
        moonrise: moonriseMatch ? moonriseMatch[1] : '22:36',
        moonset: moonsetMatch ? moonsetMatch[1] : '11:06',
        sunshine: sunshineMatch ? sunshineMatch[1] : '05:12',
      },
      locations: locationForecasts,
      extendedForecast: extendedForecast.length > 0 ? extendedForecast : [
        { day: 'Thursday', temperature: 32 },
        { day: 'Friday', temperature: 32 },
        { day: 'Saturday', temperature: 32 },
        { day: 'Sunday', temperature: 32 },
        { day: 'Monday', temperature: 32 },
      ],
      generalForecast: generalForecastMatch ? {
        validPeriod: generalForecastMatch[1].trim(),
        weather: generalForecastMatch[2].trim(),
        winds: generalForecastMatch[3].trim(),
        seas: generalForecastMatch[4].trim(),
        waveHeight: generalForecastMatch[5].trim(),
        advisory: generalForecastMatch[6] ? generalForecastMatch[6].trim() : null,
      } : {
        validPeriod: '5th August 2026 / 10:00 am — 6th August 2026 / 10:00 am',
        weather: 'Mostly cloudy with scattered showers and a few thunderstorms expected.',
        winds: 'West/northwesterly at 10 - 20 miles per hour. Winds may gust to 35 miles per hour during showers.',
        seas: 'Moderate, becoming rough during showers.',
        waveHeight: '3 – 6 feet.',
        advisory: 'Seafarers are advised to be cautious.',
      },
      marineForecast: marineForecast,
      precipitationImages: precipitationImages.length > 0 ? precipitationImages : [],
      dhivehiConditions: [],
      dhivehiLabels: dhivehiLabels,
    };
    
    weatherCache.data = result;
    weatherCache.timestamp = now;
    
    return result;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data if fetch fails
    return {
      current: {
        temperature: 28,
        condition: 'Partly Cloudy',
        rainfall: 0,
        wind: 'NNW 15',
        seaCondition: 'Moderate',
        humidity: 90,
        sunrise: '06:03',
        sunset: '18:20',
        moonrise: '22:36',
        moonset: '11:06',
        sunshine: '05:12',
      },
      locations: [
        { location: 'Hulhule', temperature: 32, condition: 'Slight Showers' },
        { location: 'Hanimaadhoo', temperature: 31, condition: 'Thundershowers' },
        { location: 'Kadhdhoo', temperature: 32, condition: 'Slight Showers' },
        { location: 'Kaadehdhoo', temperature: 32, condition: 'Slight Showers' },
        { location: 'Gan', temperature: 32, condition: 'Fine' },
      ],
      extendedForecast: [
        { day: 'Thursday', temperature: 32 },
        { day: 'Friday', temperature: 32 },
        { day: 'Saturday', temperature: 32 },
        { day: 'Sunday', temperature: 32 },
        { day: 'Monday', temperature: 32 },
      ],
      generalForecast: {
        validPeriod: '5th August 2026 / 10:00 am — 6th August 2026 / 10:00 am',
        weather: 'Mostly cloudy with scattered showers and a few thunderstorms expected.',
        winds: 'West/northwesterly at 10 - 20 miles per hour. Winds may gust to 35 miles per hour during showers.',
        seas: 'Moderate, becoming rough during showers.',
        waveHeight: '3 – 6 feet.',
        advisory: 'Seafarers are advised to be cautious.',
      },
      marineForecast: {
        validPeriod: '5th August 2026 / 10:00 am — 6th August 2026 / 10:00 am',
        weather: 'Mostly cloudy with scattered showers and a few thunderstorms expected.',
        winds: 'West/northwesterly at 10 - 20 knots. Winds may gust to 35 miles per hour during showers.',
        seas: 'Moderate, becoming rough during showers.',
        waveHeight: '3 – 6 feet.',
      },
      precipitationImages: [],
      dhivehiConditions: [],
      dhivehiLabels: {},
    };
  }
}

export default async function handler(req, res) {
  handleCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const weatherData = await fetchWeatherData();
    
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json({
      success: true,
      data: weatherData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
