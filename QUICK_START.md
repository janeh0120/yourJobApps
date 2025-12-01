# Quick Start Guide: CSV Import Feature

## 🚀 Getting Started

### Step 1: Open the App
```
http://localhost:3000
```
Or simply open `public/index.html` in a browser

### Step 2: Import Your Data
1. Click the **📥 Import CSV** button in the top-right
2. Select your `Jobs.csv` file
3. Review the preview
4. Click **Import Data**

### Step 3: Explore Your Data
- The grid shows all your job applications as colored squares
- Hover over any square to see details
- Use the filter panel on the right to explore trends

---

## 📋 CSV Format

Your CSV file needs these exact column names:

```
Company, Job Title, Year, Email Questions, One-Sided Interview, 
Behaviourial Interview, Portfolio Walkthrough, Take-home Challenge, 
Recruiter Call, Design Related, Referred, Applied On, 
Connection to Company, Tailored App, Private Posting, Status
```

**Data types:**
- `Year`: Numbers 1-5
- Boolean fields: `TRUE` or `FALSE`
- Text fields: Any text

---

## 💾 Data Storage

✅ Your data is saved to **browser localStorage**

This means:
- ✅ Data persists after closing the browser
- ✅ Data persists after refreshing the page
- ✅ Works offline
- ✅ No backend/database needed
- ❌ Different browsers/devices have separate data
- ❌ Clearing browser cache deletes data

---

## 🎯 Features

### Import CSV
- Automatically parse and validate data
- Preview before importing
- Replace existing data or keep adding entries

### Add Entries Manually
- Click **Add Job App** button
- Fill in the form
- Click **Save**

### View & Filter
- **Grid View**: Each job is a colored square
- **Detail Hover**: Hover on a square for full information
- **Filter Panel**: Search, filter by status, year, process, etc.

---

## 🛠️ Troubleshooting

### CSV not importing?
- Check column names match exactly (case-sensitive)
- Ensure Year values are numbers (1-5)
- Ensure boolean fields are `TRUE` or `FALSE`
- Check for extra spaces or line breaks

### Data disappeared?
- It's likely in a different browser or device
- Check if you cleared browser cache
- Try importing the CSV again

### Page not showing data?
- Open browser console (F12) to check for errors
- Try refreshing the page
- Make sure localStorage isn't disabled

---

## 📊 Example CSV

```csv
Company,Job Title,Year,Email Questions,One-Sided Interview,Behaviourial Interview,Portfolio Walkthrough,Take-home Challenge,Recruiter Call,Design Related,Referred,Applied On,Connection to Company,Tailored App,Private Posting,Status
Google,Product Design Intern,3,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,LinkedIn,,TRUE,FALSE,Ongoing
Microsoft,UX Design Intern,2,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,LinkedIn,,FALSE,FALSE,No Answer/Ongoing
Apple,Product Designer,3,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,Referral,Friend,TRUE,TRUE,Accepted
Amazon,Design Intern,2,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,LinkedIn,,FALSE,FALSE,Rejected
```

---

## 🎨 User Interface

```
┌─────────────────────────────────────────────────────┐
│  "123 Times I Hit Apply"  [📥 Import CSV] [+ Add] │  ← Header
├──────────────────────┬───────────────────────────────┤
│                      │   Use filters below to        │
│   GRID VIEW          │   explore trends in my job    │
│   (Colored           │   search                      │
│    squares)          │                               │
│                      │   Job Title: [search]         │
│                      │   Company: [search]           │
│                      │   Status: [dropdown]          │
│                      │   Year: [dropdown]            │
│                      │   ☐ Design-related           │
│                      │   ☐ Referred                 │
│                      │   [Apply filters] [Clear]     │
└──────────────────────┴───────────────────────────────┘
```

---

## 🔗 Architecture

```
User's Browser
├── HTML (public/index.html)
├── CSS (public/style.css)
├── JavaScript
│   ├── script.js (main app logic)
│   └── localStorage-manager.js (data management)
└── Browser Storage
    └── localStorage (jobApplications)
        └── [Your imported/added data]
```

**No backend required!** 🎉

---

## 📱 What Happens to Your Data?

| Action | Result |
|--------|--------|
| Import CSV | Data stored in localStorage |
| Add entry via form | New entry added to localStorage |
| Close browser | Data stays in localStorage ✓ |
| Refresh page | Data still there ✓ |
| Use different browser | Different data (separate localStorage) ✗ |
| Clear cache/cookies | Data deleted ✗ |
| Export data | [Future feature] |

---

## 💡 Tips

1. **Back up your data**: Export as CSV regularly (future feature)
2. **Multiple devices**: Import on each device if needed
3. **Filter combinations**: Combine multiple filters for insights
4. **Hover for details**: All info is in the detail card on hover

---

## 📞 Support

For issues, check:
1. Browser console (F12 → Console) for error messages
2. CSV format matches specification
3. Browser storage is enabled
4. Try a different browser if issues persist

Enjoy exploring your job search data! 🎯
