// Import localStorage manager
import { parseCSV, saveApplications, loadApplications, addApplication, getApplicationCount, importApplications } from './localStorage-manager.js'

// ============================================
// LANDING PAGE TOGGLE
// ============================================

function goToTracker() {
    // Navigate to data.html instead of showing tracker inline
    window.location.href = './data.html'
}

function goToLanding() {
    const landingPage = document.getElementById('landingPage')
    const trackerApp = document.getElementById('trackerApp')
    
    trackerApp.style.display = 'none'
    landingPage.classList.remove('hidden')
}

function downloadTemplate() {
    const template = `Company,Job Title,Year,Email Questions,One-Sided Interview,Behaviourial Interview,Portfolio Walkthrough,Take-home Challenge,Recruiter Call,Design Related,Referred,Applied On,Connection to Company,Tailored App,Private Posting,Status
Example Company,Product Designer,1,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,LinkedIn,,TRUE,FALSE,No Answer/Ongoing`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'job_applications_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

// ============================================
// DATA MANAGEMENT (LocalStorage-based)
// ============================================

// Helper to format application details
function formatApplicationDetails(item) {
    const title = item.Job_Title || item.JobTitle || item.Company || 'Untitled'
    const company = item.Company || '—'
    const applied = item.Applied_On || item.AppliedOn || '—'
    const connection = item.Connection_to_Company || item.Connection_To_Company || '—'
    const design = item.Design_Related ? 'Yes' : 'No'
    const referred = item.Referred ? 'Yes' : 'No'
    const tailored = item.Tailored_App ? 'Yes' : 'No'
    const status = item.Status || item.status || '—'
    
    const processFlags = [
        ['Email Questions', item.Email_Questions],
        ['One-sided', item.One_Sided_Interview],
        ['Behavioural', item.Behaviourial_Interview],
        ['Portfolio', item.Portfolio_Walkthrough],
        ['Take-home Challenge', item.Take_home_Challenge],
        ['Recruiter', item.Recruiter_Call],
        ['Private', item.Private_Posting]
    ]
    const process = processFlags.filter(([label, flag]) => !!flag).map(([label]) => label)
    
    let year = '—'
    if (item.Year !== undefined && item.Year !== null) {
        if (typeof item.Year === 'object') year = JSON.stringify(item.Year)
        else year = String(item.Year)
    }
    
    return {
        title, company, applied, connection, design, referred, tailored, status, process, year
    }
}

// Render applications as grid squares with layered images
const renderGrid = async (params = {}) => {
    // Load ALL records from localStorage
    let allData = loadApplications()
    
    // Sort by Year Applied (ascending), then by date added (oldest first, newest last)
    allData = allData.sort((a, b) => {
        const yearA = a.Year !== undefined && a.Year !== null ? parseInt(a.Year) : Infinity
        const yearB = b.Year !== undefined && b.Year !== null ? parseInt(b.Year) : Infinity
        
        // First sort by year
        if (yearA !== yearB) return yearA - yearB
        
        // Then sort by creation date (id or createdAt) - oldest first, newest last
        const idA = a.id || a._id || 0
        const idB = b.id || b._id || 0
        return String(idA).localeCompare(String(idB))
    })
    
    const gridContainer = document.querySelector('#gridContainer')
    gridContainer.innerHTML = ''
    
    // Check if any filters are actually active
    const hasActiveFilters = Object.keys(params).length > 0
    
    // Helper function to check if an entry matches the filters
    const matchesFilters = (item, filters) => {
        if (Object.keys(filters).length === 0) return true // No filters applied
        
        if (filters.jobTitle && !item.Job_Title?.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false
        if (filters.company && !item.Company?.toLowerCase().includes(filters.company.toLowerCase())) return false
        if (filters.connectionToCompany && !item.Connection_to_Company?.toLowerCase().includes(filters.connectionToCompany.toLowerCase())) return false
        if (filters.status && item.Status?.toLowerCase() !== filters.status.toLowerCase()) return false
        if (filters.year && item.Year !== parseInt(filters.year)) return false
        if (filters.design && !item.Design_Related) return false
        if (filters.referred && !item.Referred) return false
        if (filters.tailored && !item.Tailored_App) return false
        
        // Check process filters (AND logic)
        if (filters.process) {
            const processTags = filters.process.split(',').map(t => t.trim().toLowerCase())
            for (const tag of processTags) {
                if (tag === 'email' && !item.Email_Questions) return false
                if (tag === 'one-sided' && !item.One_Sided_Interview) return false
                if (tag === 'behavioural' && !item.Behaviourial_Interview) return false
                if (tag === 'portfolio' && !item.Portfolio_Walkthrough) return false
                if (tag === 'recruiter' && !item.Recruiter_Call) return false
                if (tag === 'design' && !item.Take_home_Challenge) return false
                if (tag === 'private' && !item.Private_Posting) return false
            }
        }
        
        return true
    }
    
    allData.forEach(item => {
        const isMatch = matchesFilters(item, params)
        const shouldFade = hasActiveFilters && !isMatch
        const square = document.createElement('div')
        square.className = 'grid-square'
        if (shouldFade) square.classList.add('grid-square--faded')
        
        // Build list of image layers with metadata about what they represent
        const layers = []
        
        
        // Layer 2: Process type images (multiple possible)
        if (item.Email_Questions) layers.push({ name: 'email_questions.png', relatedFilters: ['process'] })
        if (item.One_Sided_Interview) layers.push({ name: 'one-sided_interview.png', relatedFilters: ['process'] })
        if (item.Behaviourial_Interview) layers.push({ name: 'behavioural_interview.png', relatedFilters: ['process'] })
        if (item.Portfolio_Walkthrough) layers.push({ name: 'portfolio_walkthrough.png', relatedFilters: ['process'] })
        if (item.Take_home_Challenge) layers.push({ name: 'take-home_challenge.png', relatedFilters: ['process'] })
        if (item.Recruiter_Call) layers.push({ name: 'recruiter_call.png', relatedFilters: ['process'] })
        
        // Layer 3: Private Posting
        if (item.Private_Posting) layers.push({ name: 'private_posting.png', relatedFilters: ['process'] })
        
        // Layer 4: Other status images (no answer, ongoing)
        if (item.Status) {
            const status = String(item.Status).toLowerCase()
            if (status.includes('no answer') || status.includes('ongoing')) layers.push({ name: 'no_answer_ongoing.png', relatedFilters: ['status'] })
        }
        
        // Layer 5: Design-related
        if (item.Design_Related) layers.push({ name: 'design-related.png', relatedFilters: ['design'] })
        
        // Layer 6: Referred
        if (item.Referred) layers.push({ name: 'referred.png', relatedFilters: ['referred'] })
        
        // Layer 7: Tailored App
        if (item.Tailored_App) layers.push({ name: 'tailored_app.png', relatedFilters: ['tailored'] })
        
        // Layer 8 (NEAR TOP): Year images - on top of most things
        if (item.Year !== undefined && item.Year !== null) {
            const year = parseInt(item.Year)
            if (year >= 1 && year <= 5) {
                layers.push({ name: `Year${year}.png`, relatedFilters: ['year'] })
            }
        }
        
        // Layer 9 (VERY TOP/FRONT): Accepted and Rejected status images - on top of everything
        if (item.Status) {
            const status = String(item.Status).toLowerCase()
            if (status.includes('accepted')) layers.push({ name: 'accepted.png', relatedFilters: ['status'] })
            else if (status.includes('rejected')) layers.push({ name: 'rejected.png', relatedFilters: ['status'] })
        }
        
        // Helper: check if an image is related to any active filters
        const imageIsRelevant = (layer) => {
            if (!hasActiveFilters) return true // No filters = all relevant
            
            // Check if this layer's related filters match any active filter
            if (params.design && layer.relatedFilters.includes('design')) return true
            if (params.referred && layer.relatedFilters.includes('referred')) return true
            if (params.tailored && layer.relatedFilters.includes('tailored')) return true
            if (params.status && layer.relatedFilters.includes('status')) return true
            if (params.year && layer.relatedFilters.includes('year')) return true
            if (params.process && layer.relatedFilters.includes('process')) return true
            if (params.jobTitle && layer.relatedFilters.includes('jobTitle')) return true
            if (params.company && layer.relatedFilters.includes('company')) return true
            if (params.connectionToCompany && layer.relatedFilters.includes('connectionToCompany')) return true
            
            return false
        }
        
        // Add layered images
        layers.forEach(layer => {
            const img = document.createElement('img')
            img.src = `./assets/images/${layer.name}`
            img.alt = layer.name.replace('.png', '').replace(/_/g, ' ')
            img.onerror = () => {
                console.warn(`Failed to load image: ${layer.name}`)
            }
            
            // Apply opacity to images that don't match active filters
            if (isMatch && hasActiveFilters && !imageIsRelevant(layer)) {
                img.style.opacity = '0.5'
            }
            
            square.appendChild(img)
        })
        
        // Add hover handlers to show detail card
        square.addEventListener('mouseenter', (e) => {
            const details = formatApplicationDetails(item)
            const tooltip = document.querySelector('#detailTooltip')
            const detailTitle = document.querySelector('#detailTitle')
            const detailContent = document.querySelector('#detailContent')
            
            detailTitle.textContent = details.title
            detailContent.innerHTML = `
                <p><strong>Company:</strong> ${escapeHtml(details.company)}</p>
                <p><strong>Applied:</strong> ${escapeHtml(details.applied)}</p>
                <p><strong>Connection:</strong> ${escapeHtml(details.connection)}</p>
                <p><strong>Design Related:</strong> ${escapeHtml(details.design)}</p>
                <p><strong>Referred:</strong> ${escapeHtml(details.referred)}</p>
                <p><strong>Tailored App:</strong> ${escapeHtml(details.tailored)}</p>
                <p><strong>Status:</strong> ${escapeHtml(details.status)}</p>
                <p><strong>Process:</strong> ${details.process.length ? details.process.map(escapeHtml).map(s => `<span class="badge">${s}</span>`).join(' ') : '—'}</p>
                <p><strong>Year:</strong> ${escapeHtml(details.year)}</p>
            `
            
            // Position tooltip near the square with boundary checks
            const rect = square.getBoundingClientRect()
            tooltip.style.display = 'block' // Display first to get dimensions
            
            const tooltipRect = tooltip.getBoundingClientRect()
            const tooltipWidth = tooltipRect.width
            const tooltipHeight = tooltipRect.height
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const padding = 10
            
            // Calculate horizontal position (right of square by default)
            let left = rect.right + padding
            // If tooltip would overflow right edge, position it to the left of square instead
            if (left + tooltipWidth > viewportWidth) {
                left = rect.left - tooltipWidth - padding
            }
            
            // Calculate vertical position (align with top by default)
            let top = rect.top
            // If tooltip would overflow bottom edge, position it above the square instead
            if (top + tooltipHeight > viewportHeight) {
                top = Math.max(0, viewportHeight - tooltipHeight - padding)
            }
            
            tooltip.style.left = left + 'px'
            tooltip.style.top = top + 'px'
        })
        
        square.addEventListener('mouseleave', (e) => {
            const tooltip = document.querySelector('#detailTooltip')
            tooltip.style.display = 'none'
        })
        
        gridContainer.appendChild(square)
    })
    
    getCount()
}

// Initial render grid on page load
renderGrid()

// handle form submission
const form = document.querySelector('#myForm')
if (form) {
    form.addEventListener('submit', async (evt) => {
        evt.preventDefault()

        // build payload from form elements
        const fd = new FormData(form)
        const out = {}
        for (const [k, v] of fd.entries()) {
            // handle multiple checkboxes with same name (process)
            if (out[k]) {
                if (Array.isArray(out[k])) out[k].push(v)
                else out[k] = [out[k], v]
            } else {
                out[k] = v
            }
        }

    // convert checkbox booleans for schema-aligned fields
    out.Design_Related = !!document.querySelector('#Design_Related')?.checked
    out.Referred = !!document.querySelector('#Referred')?.checked
    out.Tailored_App = !!document.querySelector('#Tailored_App')?.checked
    out.Private_Posting = !!document.querySelector('#Private_Posting')?.checked

    // process boolean fields
    out.Email_Questions = !!document.querySelector('#Email_Questions')?.checked
    out.One_Sided_Interview = !!document.querySelector('#One_Sided_Interview')?.checked
    out.Behaviourial_Interview = !!document.querySelector('#Behaviourial_Interview')?.checked
    out.Portfolio_Walkthrough = !!document.querySelector('#Portfolio_Walkthrough')?.checked
    out.Take_home_Challenge = !!document.querySelector('#Take_home_Challenge')?.checked
    out.Recruiter_Call = !!document.querySelector('#Recruiter_Call')?.checked

        // Convert Year to integer
        if (out.Year) out.Year = parseInt(out.Year)

        // Add to localStorage
        try {
            addApplication(out)
            renderGrid()
            form.reset()
            getCount()
            closeModal()
        } catch (err) {
            console.error('Failed to save', err)
            alert('Failed to save entry: ' + err.message)
        }
    })
}

// fetch and display total count
async function getCount() {
    try {
        const count = getApplicationCount()
        const el = document.querySelector('#countBadge')
        if (el && typeof count === 'number') el.textContent = count
    } catch (err) {
        console.error('Failed to fetch count', err)
    }
}

// initial count load
getCount()

// Filter form wiring
const filterForm = document.querySelector('#filterForm')
const clearFiltersBtn = document.querySelector('#clearFilters')

function readFilters() {
    const form = new FormData(filterForm)
    const out = {}
    for (const [k, v] of form.entries()) {
        if (v === '') continue
        if (k === 'design') out.design = true
        else if (k === 'referred') out.referred = true
        else if (k === 'tailored') out.tailored = true
        else out[k] = v
    }
    // unchecked checkboxes -> undefined (no filter)
    if (!document.querySelector('#filterDesign').checked) delete out.design
    if (!document.querySelector('#filterReferred').checked) delete out.referred
    if (!document.querySelector('#filterTailored').checked) delete out.tailored
    // gather all process checkboxes selected in the filter bar (including private posting)
    const procBoxes = document.querySelectorAll('.filter-process:checked')
    if (procBoxes.length > 0) {
        const vals = Array.from(procBoxes).map(b => b.value)
        out.process = vals.join(',')
    }
    return out
}

if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const f = readFilters()
        renderGrid(f)
    })
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        filterForm.reset()
        renderGrid({})
    })
}

// Modal behavior: open/close
const modal = document.querySelector('#modal')
const openBtn = document.querySelector('#openFormBtn')
const closeTriggers = modal ? modal.querySelectorAll('[data-close]') : []

function openModal() {
    if (!modal) return
    modal.classList.add('open')
    modal.setAttribute('aria-hidden', 'false')
}

function closeModal() {
    if (!modal) return
    modal.classList.remove('open')
    modal.setAttribute('aria-hidden', 'true')
}

if (openBtn) openBtn.addEventListener('click', () => openModal())
closeTriggers.forEach(btn => btn.addEventListener('click', () => closeModal()))

// close on Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
})

// simple HTML escape helper
function escapeHtml(str) {
    if (str === undefined || str === null) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// Custom dropdown functionality
function initCustomDropdown(buttonId, menuId, hiddenInputId) {
    const button = document.querySelector(`#${buttonId}`)
    const menu = document.querySelector(`#${menuId}`)
    const hiddenInput = document.querySelector(`#${hiddenInputId}`)
    const options = menu.querySelectorAll('.custom-option')
    
    if (!button || !menu || !hiddenInput) return
    
    // Toggle menu on button click
    button.addEventListener('click', (e) => {
        e.stopPropagation()
        menu.classList.toggle('open')
    })
    
    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation()
            const value = option.getAttribute('data-value')
            const text = option.textContent.trim()
            
            // Update hidden input value
            hiddenInput.value = value
            
            // Update button text
            button.querySelector('span').textContent = text
            
            // Update selected state
            options.forEach(opt => opt.classList.remove('selected'))
            option.classList.add('selected')
            
            // Close menu
            menu.classList.remove('open')
            
            // Trigger form change for validation
            const filterForm = document.querySelector('#filterForm')
            if (filterForm) {
                filterForm.dispatchEvent(new Event('change'))
            }
        })
    })
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!button.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('open')
        }
    })
}

// Initialize custom dropdowns
initCustomDropdown('statusButton', 'statusMenu', 'filterStatus')
initCustomDropdown('yearButton', 'yearMenu', 'filterYear')

// ============================================
// CSV IMPORT FUNCTIONALITY
// ============================================

const importCsvBtn = document.querySelector('#importCsvBtn')
const csvFileInput = document.querySelector('#csvFileInput')
const importModal = document.querySelector('#importModal')
const importContent = document.querySelector('#importContent')
const importPreview = document.querySelector('#importPreview')
const importActions = document.querySelector('#importActions')
const confirmImportBtn = document.querySelector('#confirmImportBtn')
const cancelImportBtn = document.querySelector('#cancelImportBtn')

let parsedImportData = null

function openImportModal() {
    if (!importModal) return
    importModal.classList.add('open')
    importModal.setAttribute('aria-hidden', 'false')
}

function closeImportModal() {
    if (!importModal) return
    importModal.classList.remove('open')
    importModal.setAttribute('aria-hidden', 'true')
    importPreview.innerHTML = ''
    importActions.style.display = 'none'
    parsedImportData = null
}

// Import button triggers file input
if (importCsvBtn) {
    importCsvBtn.addEventListener('click', () => {
        csvFileInput.click()
    })
}

// Handle CSV file selection
if (csvFileInput) {
    csvFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        try {
            // Validate file type
            if (!file.name.toLowerCase().endsWith('.csv')) {
                throw new Error('CSV_WRONG_FILE_TYPE: Please select a .csv file. You selected a ' + file.name.split('.').pop() + ' file.')
            }
            
            if (file.size === 0) {
                throw new Error('CSV_EMPTY_FILE: The file is empty. Please select a CSV file with data.')
            }
            
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('CSV_TOO_LARGE: File is too large (' + (file.size / 1024 / 1024).toFixed(1) + 'MB). Maximum size is 10MB.')
            }
            
            const csvText = await file.text()
            try {
                parsedImportData = parseCSV(csvText)
            } catch (parseErr) {
                console.error('CSV parse error:', parseErr)
                displayCSVError(parseErr)
                parsedImportData = null
                return
            }

            console.log('CSV parsed successfully. rows=', Array.isArray(parsedImportData) ? parsedImportData.length : 0)
            // Show preview
            showImportPreview(parsedImportData)
            openImportModal()
        } catch (err) {
            console.error('Failed to parse CSV:', err)
            displayCSVError(err)
        }
        
        // Reset file input so same file can be selected again
        csvFileInput.value = ''
    })
}

function displayCSVError(err) {
    const message = err.message || String(err)
    
    let userMessage = ''
    
    if (message.includes('CSV_INVALID_FORMAT')) {
        userMessage = '❌ Invalid File Format\n\nThe file you selected is not a valid text file. Please make sure you\'re uploading a CSV file.'
    } else if (message.includes('CSV_EMPTY_FILE')) {
        userMessage = '❌ Empty CSV File\n\nYour CSV file has no data rows. Please add at least one job application entry to your CSV.'
    } else if (message.includes('CSV_NO_HEADERS')) {
        userMessage = '❌ Missing Column Headers\n\nThe first row of your CSV must contain column headers. Make sure your CSV starts with: Company, Job Title, Year, Status, etc.'
    } else if (message.includes('CSV_NO_DATA_ROWS')) {
        userMessage = '❌ No Data Rows Found\n\nYour CSV file contains only headers. Please add at least one row with job application data.'
    } else if (message.includes('CSV_DATA_VALIDATION_FAILED')) {
        // Extract the error details
        userMessage = '❌ Data Format Issues Found\n\n' + message.replace('CSV_DATA_VALIDATION_FAILED: ', '')
    } else if (message.includes('CSV_WRONG_FILE_TYPE')) {
        userMessage = '❌ Wrong File Type\n\nPlease select a CSV (.csv) file.'
    } else if (message.includes('CSV_TOO_LARGE')) {
        userMessage = '❌ File Too Large\n\n' + message.replace('CSV_TOO_LARGE: ', '')
    } else {
        userMessage = '❌ Import Error\n\n' + message
    }
    
    // Show error in a modal so it is visible above the landing overlay
    try {
        showErrorModal(userMessage, 'Import Error')
    } catch (e) {
        // Fallback to alert if modal creation fails
        alert(userMessage)
    }
}

// Create and show a reusable error modal at runtime
function showErrorModal(message, title = 'Error') {
    // Build modal DOM using same classes/styles as other modals
    const modal = document.createElement('div')
    modal.className = 'modal open'
    modal.setAttribute('aria-hidden', 'false')

    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.setAttribute('data-close', '')

    const content = document.createElement('div')
    content.className = 'modal-content'
    content.setAttribute('role', 'dialog')
    content.setAttribute('aria-modal', 'true')

    const closeBtn = document.createElement('button')
    closeBtn.className = 'modal-close'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.textContent = '×'

    const h = document.createElement('h2')
    h.textContent = title

    const body = document.createElement('div')
    body.style.maxHeight = '60vh'
    body.style.overflow = 'auto'
    body.style.marginTop = '0.5rem'
    body.innerHTML = `<p style="white-space: pre-wrap;">${escapeHtml(message)}</p>`

    const actions = document.createElement('div')
    actions.style.marginTop = '1rem'
    const ok = document.createElement('button')
    ok.className = 'save'
    ok.textContent = 'Close'
    actions.appendChild(ok)

    content.appendChild(closeBtn)
    content.appendChild(h)
    content.appendChild(body)
    content.appendChild(actions)

    modal.appendChild(overlay)
    modal.appendChild(content)

    // Close handler
    const removeModal = () => {
        modal.remove()
    }

    overlay.addEventListener('click', removeModal)
    closeBtn.addEventListener('click', removeModal)
    ok.addEventListener('click', removeModal)

    // Insert into DOM
    document.body.appendChild(modal)
    // Focus the close button for accessibility
    ok.focus()
}

function showImportPreview(data) {
    if (!data || data.length === 0) {
        importPreview.innerHTML = '<p style="color: red;">❌ No valid data found in CSV. Check that your file has the correct column headers and at least one data row.</p>'
        return
    }
    
    // Show first 5 rows as preview
    const previewRows = data.slice(0, 5)
    const columns = Object.keys(previewRows[0])
    
    let html = '<p style="margin: 0 0 1rem 0;"><strong>Preview (first 5 rows of ' + data.length + ' total):</strong></p>'
    html += '<table><thead><tr>'
    
    columns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`
    })
    
    html += '</tr></thead><tbody>'
    
    previewRows.forEach(row => {
        html += '<tr>'
        columns.forEach(col => {
            const val = row[col]
            const display = typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : escapeHtml(String(val || ''))
            html += `<td>${display}</td>`
        })
        html += '</tr>'
    })
    
    html += '</tbody></table>'
    importPreview.innerHTML = html
    importActions.style.display = 'flex'
}

// Confirm import button
if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', async () => {
        if (!parsedImportData) {
            alert('❌ No data to import. Please select a CSV file first.')
            return
        }
        
        try {
            importApplications(parsedImportData)
            closeImportModal()
            const importedCount = Array.isArray(parsedImportData) ? parsedImportData.length : 0
            // Read back saved count from localStorage to be sure
            const totalSaved = typeof getApplicationCount === 'function' ? getApplicationCount() : null
            console.log('Import successful — importedCount=', importedCount, 'totalSaved=', totalSaved, 'parsedImportData=', parsedImportData)
            alert(`Successfully imported ${totalSaved} job application(s).`)

            // Ensure redirect reliably happens after alert — use await-friendly approach
            await new Promise(resolve => setTimeout(resolve, 200))
            window.location.assign('./data.html')
        } catch (err) {
            console.error('Failed to import:', err)
            let message = err.message || String(err)
            
            if (message.includes('SAVE_INVALID_DATA') || message.includes('IMPORT_NO_DATA')) {
                showErrorModal('Invalid Data\n\nThe data could not be saved. Please make sure your CSV contains valid data.', 'Import Failed')
            } else if (message.includes('localStorage')) {
                showErrorModal('Storage Error\n\nYour browser storage may be full. Please delete some entries or clear your browser data and try again.', 'Import Failed')
            } else if (message.includes('null')) {
                showErrorModal('Data Error\n\nThere was an issue processing your data. Please check that your CSV file is properly formatted and try again.', 'Import Failed')
            } else {
                showErrorModal('Import Failed\n\n' + message, 'Import Failed')
            }
        }
    })
}

// Cancel import button
if (cancelImportBtn) {
    cancelImportBtn.addEventListener('click', () => {
        closeImportModal()
    })
}

// Close import modal on overlay click
const importOverlay = importModal?.querySelector('.modal-overlay')
if (importOverlay) {
    importOverlay.addEventListener('click', closeImportModal)
}

// Close import modal on close button
const importCloseBtn = importModal?.querySelector('.modal-close')
if (importCloseBtn) {
    importCloseBtn.addEventListener('click', closeImportModal)
}

// Close import modal on Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && importModal?.classList.contains('open')) {
        closeImportModal()
    }
})

// Check if we should open the form modal on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if coming from landing page with openModal flag
    const urlParams = new URLSearchParams(window.location.search)
    const shouldOpenModal = urlParams.get('openModal') === 'true' || localStorage.getItem('openFormOnLoad') === 'true'
    
    if (shouldOpenModal) {
        localStorage.removeItem('openFormOnLoad')
        // Clean up the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
        
        setTimeout(() => {
            openModal()
        }, 100)
    }
})
