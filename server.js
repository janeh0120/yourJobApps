// Express is a framework for building APIs and web apps
// See also: https://expressjs.com/
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express app
const app = express()

// Serve static files from /public folder with proper path
app.use(express.static(path.join(__dirname, 'public')))

// Define index.html as the root explicitly
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')) })

// Enable express to parse JSON data
app.use(express.json())

// Note: This app now uses browser localStorage instead of a backend database
// All data persistence is handled client-side

const port = 3000
app.listen(port, () => {
    console.log(`Express is live at http://localhost:${port}`)
})
