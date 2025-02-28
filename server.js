const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 80;

// Serve static files
app.use(express.static('.'));
app.use(express.json());

const VIEWS_FILE = path.join(__dirname, 'data', 'views.json');

// In-memory view counter storage
let viewsInMemory = null;
const SAVE_INTERVAL = 30000; // Save to file every 30 seconds (30000ms)

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

// Initialize views file if it doesn't exist
async function initViewsFile() {
    try {
        await fs.access(VIEWS_FILE);
        // Load existing data into memory
        const data = await fs.readFile(VIEWS_FILE, 'utf8');
        viewsInMemory = JSON.parse(data);
    } catch {
        const initialData = {
            boxes: 0,
            wallpaper: 0,
            billboard: 0
        };
        await fs.writeFile(VIEWS_FILE, JSON.stringify(initialData, null, 2));
        viewsInMemory = initialData;
    }
}

// Save in-memory views to file
async function saveViewsToFile() {
    try {
        if (viewsInMemory) {
            await fs.writeFile(VIEWS_FILE, JSON.stringify(viewsInMemory, null, 2));
            console.log('Views saved to file:', new Date().toISOString());
        }
    } catch (error) {
        console.error('Error saving views to file:', error);
    }
}

// Get views
app.get('/api/views.json', async (req, res) => {
    try {
        // Return in-memory data instead of reading file
        if (viewsInMemory) {
            return res.json(viewsInMemory);
        }
        
        // Fallback to reading from file if memory is null
        const data = await fs.readFile(VIEWS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading view counts' });
    }
});

// Update views
app.post('/api/updateViews', async (req, res) => {
    try {
        const productId = req.body.productId;
        
        // Only update if it's a valid product
        if (productId && viewsInMemory && productId in viewsInMemory) {
            viewsInMemory[productId]++;
            return res.json({ success: true, count: viewsInMemory[productId] });
        }
        
        res.status(400).json({ error: 'Invalid product ID' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating view counts' });
    }
});

// Initialize and start server
async function start() {
    await ensureDataDir();
    await initViewsFile();
    
    // Set up periodic saving
    setInterval(saveViewsToFile, SAVE_INTERVAL);
    
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`View counts will be saved every ${SAVE_INTERVAL/1000} seconds`);
    });
}

start();

// Handle graceful shutdown to save views before exit
process.on('SIGINT', async () => {
    console.log('Saving views before shutdown...');
    await saveViewsToFile();
    process.exit(0);
});