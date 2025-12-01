/**
 * LocalStorage Manager for Job Applications
 * Handles saving, loading, and managing job application data in browser localStorage
 */

const STORAGE_KEY = 'jobApplications'

/**
 * Parse CSV data from a string
 * @param {string} csvText - Raw CSV text
 * @returns {Array<Object>} Array of parsed objects
 */
export function parseCSV(csvText) {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    // Parse header
    const header = parseCSVLine(lines[0])
    
    // Map header names to normalized field names
    const headerMap = {
        'Company': 'Company',
        'Job Title': 'Job_Title',
        'Year': 'Year',
        'Email Questions': 'Email_Questions',
        'One-Sided Interview': 'One_Sided_Interview',
        'Behaviourial Interview': 'Behaviourial_Interview',
        'Portfolio Walkthrough': 'Portfolio_Walkthrough',
        'Take-home Challenge': 'Take_home_Challenge',
        'Recruiter Call': 'Recruiter_Call',
        'Design Related': 'Design_Related',
        'Referred': 'Referred',
        'Applied On': 'Applied_On',
        'Connection to Company': 'Connection_to_Company',
        'Tailored App': 'Tailored_App',
        'Private Posting': 'Private_Posting',
        'Status': 'Status'
    }

    // Parse data rows
    const data = []
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const values = parseCSVLine(lines[i])
        const row = {}
        
        header.forEach((col, idx) => {
            const normalizedCol = headerMap[col] || col
            const value = values[idx] || ''
            
            // Convert boolean strings to actual booleans
            if (['Email_Questions', 'One_Sided_Interview', 'Behaviourial_Interview', 
                 'Portfolio_Walkthrough', 'Take_home_Challenge', 'Recruiter_Call',
                 'Design_Related', 'Referred', 'Tailored_App', 'Private_Posting'].includes(normalizedCol)) {
                row[normalizedCol] = value.toLowerCase() === 'true'
            }
            // Convert Year to integer
            else if (normalizedCol === 'Year') {
                row[normalizedCol] = value ? parseInt(value) : null
            }
            // Keep other fields as strings
            else {
                row[normalizedCol] = value
            }
        })
        
        data.push(row)
    }
    
    return data
}

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Parsed values
 */
function parseCSVLine(line) {
    const result = []
    let current = ''
    let insideQuotes = false
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"'
                i++
            } else {
                insideQuotes = !insideQuotes
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    
    result.push(current.trim())
    return result
}

/**
 * Save applications to localStorage
 * @param {Array<Object>} applications - Array of job applications
 */
export function saveApplications(applications) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
        console.log(`Saved ${applications.length} applications to localStorage`)
    } catch (err) {
        console.error('Failed to save to localStorage:', err)
        throw new Error('Failed to save data to localStorage. Your storage may be full.')
    }
}

/**
 * Load applications from localStorage
 * @returns {Array<Object>} Array of job applications
 */
export function loadApplications() {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (err) {
        console.error('Failed to load from localStorage:', err)
        return []
    }
}

/**
 * Clear all applications from localStorage
 */
export function clearApplications() {
    try {
        localStorage.removeItem(STORAGE_KEY)
        console.log('Cleared applications from localStorage')
    } catch (err) {
        console.error('Failed to clear localStorage:', err)
    }
}

/**
 * Add a new application to localStorage
 * @param {Object} application - Single job application object
 */
export function addApplication(application) {
    const apps = loadApplications()
    apps.push({ ...application, id: Date.now().toString() })
    saveApplications(apps)
}

/**
 * Get the count of applications in localStorage
 * @returns {number} Count of applications
 */
export function getApplicationCount() {
    return loadApplications().length
}

/**
 * Import applications from CSV, replacing existing data
 * @param {Array<Object>} applications - Parsed CSV data
 */
export function importApplications(applications) {
    // Add unique IDs if not present
    const withIds = applications.map((app, idx) => ({
        ...app,
        id: app.id || `imported_${Date.now()}_${idx}`
    }))
    saveApplications(withIds)
}

/**
 * Merge imported applications with existing ones
 * @param {Array<Object>} newApplications - Parsed CSV data
 */
export function mergeApplications(newApplications) {
    const existing = loadApplications()
    const withIds = newApplications.map((app, idx) => ({
        ...app,
        id: app.id || `imported_${Date.now()}_${idx}`
    }))
    saveApplications([...existing, ...withIds])
}
