# CSV Import Feature - Implementation Guide

## Overview
The application has been modified to allow users to import their own job application CSV data. Instead of relying on a backend database, data is now stored in the browser's **localStorage**, making it completely client-side.

## Key Changes

### 1. **localStorage-based Storage**
   - All job application data is now stored in the browser's localStorage
   - Data persists across browser sessions
   - No backend/database required
   - Users can add, view, and filter their data locally

### 2. **CSV Import Functionality**
   - New "📥 Import CSV" button in the header
   - Accepts CSV files matching the Prisma schema
   - Shows preview of first 5 rows before importing
   - Replaces existing data (no merge by default)

### 3. **New Files Added**
   - `public/localStorage-manager.js` - Handles all localStorage operations and CSV parsing
   - Updated `public/script.js` - Replaced backend API calls with localStorage functions
   - Updated `public/index.html` - Added import button and modal
   - Updated `public/style.css` - Added styling for import UI

### 4. **Removed Dependencies**
   - No longer requires the Express backend API for data operations
   - Still compatible with the existing server (but server isn't needed for data)
   - All filtering and sorting happens client-side

## CSV Format

Your CSV file should have these columns (case-sensitive):
```
Company, Job Title, Year, Email Questions, One-Sided Interview, Behaviourial Interview, Portfolio Walkthrough, Take-home Challenge, Recruiter Call, Design Related, Referred, Applied On, Connection to Company, Tailored App, Private Posting, Status
```

### Data Type Guidelines:
- **Company, Job Title, Applied On, Connection to Company, Status**: Text
- **Year**: Number (1-5)
- **Boolean fields** (all others): TRUE or FALSE

### Example CSV row:
```
Google,Product Design Intern,3,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,LinkedIn,,TRUE,FALSE,Ongoing
```

## Usage

### First Time Using the App:
1. Click the "📥 Import CSV" button
2. Select your Jobs.csv file (or any CSV with the correct format)
3. Review the preview
4. Click "Import Data" to confirm
5. Your data will be saved to localStorage

### Adding New Applications:
1. Click "Add Job App" button
2. Fill in the form
3. Click "Save"
4. New entry will be saved to localStorage

### Viewing & Filtering:
- All entries are displayed as colored squares on the left
- Use the filter panel on the right to filter by:
  - Job Title
  - Company
  - Application Status (Accepted, Rejected, No Answer/Ongoing)
  - Year Applied (1st-5th year)
  - Application Process (Email, Interview types, Portfolio review, etc.)
  - Other attributes (Design-related, Referred, Tailored App, Private Posting)

## Data Persistence

✅ **Data survives:**
- Browser restarts
- Tab refreshes
- Website revisits (same browser, same device)

❌ **Data is lost if:**
- Browser cache/cookies are cleared
- Private browsing session ends
- Different browser/device is used
- Browser storage is manually cleared

## Limitations of localStorage

| Aspect | Limitation |
|--------|-----------|
| **Storage Size** | ~5-10MB per domain |
| **Device Specific** | Only accessible on the browser/device where imported |
| **Shareability** | Can't easily share data between devices |
| **Backup** | Manual export needed (can export as CSV and re-import) |

## Technical Implementation

### localStorage Manager (`localStorage-manager.js`)
The manager provides these functions:
- `parseCSV(csvText)` - Parses CSV text to objects
- `saveApplications(applications)` - Saves to localStorage
- `loadApplications()` - Loads from localStorage
- `addApplication(application)` - Adds single entry
- `importApplications(applications)` - Imports multiple entries

### Script Changes (`script.js`)
- Replaced all `/apps` API calls with localStorage functions
- CSV import modal with preview
- Form submission saves to localStorage instead of backend
- Count badge updates from localStorage

## No Backend Required

The app now works **completely offline** or without any backend:
- Remove the `server.js` if you don't need it
- All functionality works with static HTML/CSS/JS + localStorage
- Can be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.)

## Reverting to Backend (Optional)

If you want to keep the database backend alongside localStorage:
1. The API routes in `/routes/api.js` still exist
2. You can modify the app to sync localStorage with the backend
3. Current implementation prioritizes localStorage (backend not used)
