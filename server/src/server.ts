import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing OPENWEATHER_API_KEY in .env file.');
  process.exit(1);
}

const HISTORY_FILE = path.join(__dirname, 'searchHistory.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// === Routes ===

// Get search history
app.get('/api/weather/history', async (_req, res) => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const cities = JSON.parse(data);
    res.json(cities);
  } catch {
    res.status(500).json({ error: 'Could not read history file.' });
  }
});

// Fetch weather and save city
app.post('/api/weather', async (req, res) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ error: 'City name is required' });

  try {
    // Get geolocation
    const geoRes = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );

    if (!geoRes.data.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon } = geoRes.data[0];

    // Get weather forecast
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
    );

    const forecast = weatherRes.data;

    // Update search history
    let history = [];
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(data);
    } catch {
      // If file not found, use empty history
      history = [];
    }

    const newEntry = { id: uuidv4(), city, lat, lon };
    history.push(newEntry);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));

    res.json({ forecast, saved: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Fallback route to serve frontend
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});


