import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js'; // or './weatherRoutes.ts' if you're using TypeScript

const router = Router();

// Mount all weather-related API routes under /api/weather
router.use('/weather', weatherRoutes);

export default router;

