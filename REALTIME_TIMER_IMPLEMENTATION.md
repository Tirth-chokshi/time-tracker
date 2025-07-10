# Real-Time Timer Session Management Implementation

## Overview
This implementation provides persistent, real-time timer functionality that survives tab closures, browser restarts, and maintains synchronization across multiple sessions.

## Key Features

### 1. Session Persistence
- **Database Storage**: User sessions are stored in MongoDB with real-time state
- **Cross-Tab Sync**: Multiple tabs/windows stay synchronized
- **Automatic Recovery**: Timer state is restored when reopening the app
- **Theme Persistence**: User's theme selection is preserved across sessions

### 2. Real-Time Timer Management
- **Live Updates**: Timer displays real-time elapsed time for work and break sessions
- **Background Calculation**: Timer continues running even when tab is inactive
- **Automatic Sync**: Session data is automatically synchronized with the server
- **Heartbeat System**: Regular heartbeat signals keep the session alive

### 3. API Endpoints

#### `/api/session` 
- **GET**: Retrieve current user session state
- **POST**: Update session state (entries, status, theme, stats)
- **DELETE**: Reset current session to initial state

#### `/api/heartbeat`
- **POST**: Send periodic heartbeat to maintain session activity

### 4. Custom Hooks

#### `useSessionManager`
- Manages all session-related state and server synchronization
- Handles automatic saving with debouncing (2-second delay)
- Provides session refresh and reset functionality
- Manages page visibility changes and beforeunload events

#### `useRealtimeTimer`
- Calculates live work and break timers in real-time
- Automatically updates daily statistics
- Provides clock in/out functionality
- Formats time displays and progress calculations

## Technical Implementation

### Data Flow
1. **Session Initialization**: On app load, session data is fetched from the server
2. **Real-Time Updates**: Timer hooks calculate elapsed time every second
3. **Automatic Saving**: Changes are debounced and saved to server every 2 seconds
4. **Heartbeat**: Every 30 seconds, a heartbeat signal is sent to maintain session
5. **Visibility Handling**: When tab becomes hidden, data is saved immediately
6. **Cross-Tab Sync**: Periodic fetching ensures multiple tabs stay synchronized

### Database Schema (UserSession)
```javascript
{
  userId: String,
  userEmail: String,
  userName: String,
  currentStatus: 'IN' | 'OUT',
  entries: [{
    id: Number,
    timestamp: Number,
    type: 'IN' | 'OUT',
    time: String
  }],
  dailyStats: {
    totalWorkMinutes: Number,
    totalBreakMinutes: Number,
    isComplete: Boolean
  },
  currentTheme: String,
  lastActiveDate: String, // YYYY-MM-DD
  lastActivity: Date,
  sessionStartTime: Number
}
```

### Key Benefits

1. **True Persistence**: Timer state survives browser crashes, tab closures, and device restarts
2. **Real-Time Accuracy**: Timer displays exact elapsed time regardless of when the page was last active
3. **Multi-Device Support**: Same user can access consistent state across different devices
4. **Automatic Recovery**: No manual intervention needed to restore timer state
5. **Theme Consistency**: User preferences are maintained across sessions
6. **Data Integrity**: All timer data is safely stored in the database with automatic backups

### Error Handling

- **Session Errors**: Graceful error display with refresh option
- **Network Issues**: Automatic retry mechanisms for failed saves
- **Authentication**: Proper session validation and error states
- **Loading States**: Comprehensive loading indicators during data fetching

### Performance Optimizations

- **Debounced Saves**: Prevents excessive server requests during rapid changes
- **Selective Updates**: Only changed data is sent to the server
- **Background Processing**: Timer calculations don't block the UI
- **Efficient Queries**: Database queries are optimized with proper indexing

## Usage

The implementation is plug-and-play. Simply:
1. Import the hooks in your component
2. Use the returned data and functions
3. The system handles all persistence automatically

```javascript
const { sessionData, updateSessionData, resetSession } = useSessionManager();
const { liveWorkSeconds, clockIn, clockOut } = useRealtimeTimer(sessionData, updateSessionData);
```

This provides a robust, production-ready timer system that ensures data never gets lost and provides true real-time functionality.
