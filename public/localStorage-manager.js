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
    if (!csvText || typeof csvText !== 'string') {
        throw new Error('CSV_INVALID_FORMAT: File content is not text. Please ensure you uploaded a valid CSV file.')
    }
    
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
        throw new Error('CSV_EMPTY_FILE: CSV file is empty or contains only headers. Please add at least one data row.')
    }

    // Parse header
    const header = parseCSVLine(lines[0])
    if (header.length === 0 || !header[0]) {
        throw new Error('CSV_NO_HEADERS: CSV file has no headers. First row should contain column names.')
    }
    
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
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        try {
            const values = parseCSVLine(lines[i])
            const row = {}
            let hasRequiredData = false
            
            header.forEach((col, idx) => {
                const normalizedCol = headerMap[col] || col
                const value = values[idx] || ''
                
                // Track if row has any data
                if (value.trim()) {
                    hasRequiredData = true
                }
                
                // Convert boolean strings to actual booleans
                if (['Email_Questions', 'One_Sided_Interview', 'Behaviourial_Interview', 
                     'Portfolio_Walkthrough', 'Take_home_Challenge', 'Recruiter_Call',
                     'Design_Related', 'Referred', 'Tailored_App', 'Private_Posting'].includes(normalizedCol)) {
                    const boolVal = value.toLowerCase().trim()
                    if (boolVal && !['true', 'false', '1', '0', 'yes', 'no'].includes(boolVal)) {
                        errors.push(`Row ${i + 1}: "${normalizedCol}" should be TRUE or FALSE, got "${value}"`)
                    }
                    row[normalizedCol] = boolVal === 'true' || boolVal === '1' || boolVal === 'yes'
                }
                // Convert Year to integer
                else if (normalizedCol === 'Year') {
                    if (value && isNaN(parseInt(value))) {
                        errors.push(`Row ${i + 1}: "Year" should be a number, got "${value}"`)
                    }
                    row[normalizedCol] = value ? parseInt(value) : null
                }
                // Keep other fields as strings
                else {
                    row[normalizedCol] = value
                }
            })
            
            // Only add row if it has some data
            if (hasRequiredData) {
                data.push(row)
            }
        } catch (err) {
            errors.push(`Row ${i + 1}: Failed to parse - ${err.message}`)
        }
    }
    
    if (errors.length > 0) {
        const errorCount = Math.min(3, errors.length)
        const errorList = errors.slice(0, errorCount).join('\n')
        const remaining = errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''
        throw new Error(`CSV_DATA_VALIDATION_FAILED: Found ${errors.length} formatting issues:\n\n${errorList}${remaining}`)
    }
    
    if (data.length === 0) {
        throw new Error('CSV_NO_DATA_ROWS: CSV file contains only headers. Please add at least one data row with job application information.')
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
        if (!applications || !Array.isArray(applications)) {
            throw new Error('SAVE_INVALID_DATA: Data must be an array of applications.')
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
        console.log(`Saved ${applications.length} applications to localStorage`)
    } catch (err) {
        console.error('Failed to save to localStorage:', err)
        if (err.message.includes('SAVE_INVALID_DATA')) {
            throw err
        }
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
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
        throw new Error('IMPORT_NO_DATA: No valid applications to import. Please check your CSV file.')
    }
    
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
