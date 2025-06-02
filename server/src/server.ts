import express, { Request, Response } from 'express';
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

// GET search history
app.get('/api/weather/history', async (_req: Request, res: Response) => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const cities = JSON.parse(data);
    res.json(cities);
  } catch {
    res.status(500).json({ error: 'Could not read history file.' });
  }
});

// POST new city and get forecast
app.post('/api/weather', async (req: Request, res: Response) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ error: 'City name is required' });

  try {
    const geoRes = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );

    if (!geoRes.data.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon } = geoRes.data[0];

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
    );

    const forecast = weatherRes.data;

    let history = [];
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(data);
    } catch {
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

// DELETE city by ID
app.delete('/api/weather/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(data);

    const updatedHistory = history.filter((entry: { id: string }) => entry.id !== id);

    if (history.length === updatedHistory.length) {
      return res.status(404).json({ error: 'City ID not found' });
    }

    await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
    res.json({ message: 'City deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

// Fallback route to frontend
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});





