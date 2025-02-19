const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 8000;

// Serve static files
app.use(express.static('.'));
app.use(express.json());

const VIEWS_FILE = path.join(__dirname, 'data', 'views.json');

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
    } catch {
        const initialData = {
            boxes: 0,
            wallpaper: 0,
            billboard: 0
        };
        await fs.writeFile(VIEWS_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Get views
app.get('/api/views.json', async (req, res) => {
    try {
        const data = await fs.readFile(VIEWS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading view counts' });
    }
});

// Update views
app.post('/api/updateViews', async (req, res) => {
    try {
        await fs.writeFile(VIEWS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error updating view counts' });
    }
});

// Initialize and start server
async function start() {
    await ensureDataDir();
    await initViewsFile();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

start();