const express = require('express');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const cache = {};
const CACHE_TTL = 60 * 5 * 1000; // 5 minutes

// default route to check if backend is running
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get('/api/weatherToday', async (req, res) => {
  const { lat, lon, units = "metric" } = req.query;
  const cacheKey = `${lat},${lon},${units}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.json(cache[cacheKey].data);
  }

  try {
    const [air, current] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
        params: { lat, lon, appid: OPENWEATHER_API_KEY }
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon, appid: OPENWEATHER_API_KEY, units }
      }),
    ]);

    const aqi = air.data.list[0].main.aqi;
    const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const category = levels[aqi - 1];
    const weather = {
      AQI: aqi,
      category,
      temp: current.data.main.temp,
      humidity: current.data.main.humidity,
      rain: current.data.rain ? 'Yes' : 'None',
      units,
    };
    cache[cacheKey] = { data: weather, timestamp: now };
    res.json(weather);
  } catch (err) {
    console.error('Weather fetch failed:', err.message);
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});


app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
