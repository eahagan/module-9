import path from 'path';
import { fileURLToPath } from 'url';

// These two lines are needed because `__dirname` doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));
