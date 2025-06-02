import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const historyPath = path.join(__dirname, '../../../searchHistory.json');

router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Read and parse existing history
    const data = await fs.readFile(historyPath, 'utf-8');
    const cities = JSON.parse(data);

    // Filter out the city with the matching id
    const updatedCities = cities.filter((city: { id: string }) => city.id !== id);

    // Save updated list
    await fs.writeFile(historyPath, JSON.stringify(updatedCities, null, 2));

    res.status(200).json({ message: 'City deleted successfully', cities: updatedCities });
  } catch (err) {
    console.error('Error deleting city:', err);
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;

