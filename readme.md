# Job Application Tracker

A visual job search analytics tool that tracks and visualizes job applications using an interactive grid. Filter applications by status, year, process type, and more to discover patterns in my job search. Instead of relying on a backend database, data is now stored in the browser's **localStorage**, making it completely client-side.


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
