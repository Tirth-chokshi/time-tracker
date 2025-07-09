# Daily Logs Feature

This document describes the new daily logs feature that has been added to the Time Tracker application.

## Overview

The daily logs feature allows users to:
- Save their daily time tracking data to a database
- View all their historical daily logs
- See detailed statistics for each day
- Browse through paginated logs

## Components Added

### 1. Database Setup
- **MongoDB Integration**: Added Mongoose for database operations
- **Database Model**: `DailyLog` model to store daily time tracking data
- **Connection Utility**: Database connection helper in `src/lib/mongodb.js`

### 2. API Endpoints
- **POST /api/daily-logs**: Save or update a daily log
- **GET /api/daily-logs**: Retrieve daily logs with pagination

### 3. UI Components
- **Save Log Button**: Manual save functionality on the main tracker page
- **View Logs Button**: Navigation to the logs page
- **Logs Page**: Dedicated page to view all historical logs
- **Toast Notifications**: User feedback for save operations
- **Log Details Modal**: Detailed view of individual daily logs

### 4. Features

#### Daily Log Storage
Each daily log contains:
- User information (ID, email, name)
- Date (YYYY-MM-DD format)
- All time entries (clock in/out times)
- Daily statistics (work time, break time, completion status)
- Theme preference

#### Logs Page Features
- **Grid View**: Cards showing key stats for each day
- **Pagination**: Browse through logs 10 at a time
- **Progress Indicators**: Visual progress bars for daily goals
- **Click to Expand**: Modal with detailed time entries
- **Responsive Design**: Works on mobile and desktop

#### Automatic Features
- **Duplicate Prevention**: One log per user per day (updates existing)
- **Authentication**: Only authenticated users can save/view logs
- **Input Validation**: Prevents saving empty logs

## Usage Instructions

### Saving a Daily Log
1. Use the time tracker as normal (clock in/out)
2. Click the "Save Log" button when you want to save your progress
3. The system will save or update your log for the current date
4. Toast notification will confirm success or show errors

### Viewing Logs
1. Click the "Logs" button in the header
2. Browse through your historical daily logs
3. Click on any log card to see detailed time entries
4. Use pagination to navigate through older logs

### Auto-Save (Optional)
- Uncomment the auto-save line in the main page to automatically save when daily goal is reached

## Environment Setup

Add to your `.env.local` file:
```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/time-tracker
```

For production, use a MongoDB Atlas connection string.

## Database Schema

```javascript
{
  userId: String,        // User ID from NextAuth
  userEmail: String,     // User email
  userName: String,      // User display name
  date: String,          // YYYY-MM-DD format
  entries: [Entry],      // Array of clock in/out entries
  dailyStats: {
    totalWorkMinutes: Number,
    totalBreakMinutes: Number,
    isComplete: Boolean
  },
  theme: String,         // UI theme preference
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

## Technical Details

### Security
- Server-side authentication using NextAuth
- User isolation (users can only see their own logs)
- Input validation and sanitization

### Performance
- Pagination for large datasets
- Indexed database queries
- Optimized for quick retrieval

### Error Handling
- Graceful error handling with user feedback
- Toast notifications for all operations
- Fallback UI states

## Future Enhancements

Potential improvements that could be added:
- Export logs to CSV/PDF
- Weekly/monthly summary reports
- Time tracking analytics and insights
- Goal setting and tracking
- Team sharing and collaboration
- Data backup and restore

## Files Modified/Created

### New Files
- `src/lib/mongodb.js` - Database connection
- `src/models/DailyLog.js` - Database model
- `src/app/api/daily-logs/route.js` - API endpoints
- `src/app/logs/page.js` - Logs viewing page
- `src/components/Toast.js` - Notification system

### Modified Files
- `src/app/page.js` - Added save functionality and navigation
- `.env.local` - Added MongoDB configuration

## Dependencies Added
- `mongoose` - MongoDB object modeling for Node.js
