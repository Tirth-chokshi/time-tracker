import { useState, useEffect, useCallback, useRef } from 'react';

export const useRealtimeTimer = (sessionData, updateSessionData) => {
  const [liveWorkSeconds, setLiveWorkSeconds] = useState(0);
  const [liveBreakSeconds, setLiveBreakSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Calculate live timers based on current session state
  const calculateLiveTimers = useCallback(() => {
    if (!sessionData || !sessionData.entries) {
      setLiveWorkSeconds(0);
      setLiveBreakSeconds(0);
      return;
    }

    const now = Date.now();
    const { currentStatus, entries } = sessionData;

    if (currentStatus === 'IN' && entries.length > 0) {
      // Find the last IN entry
      const lastIn = [...entries].reverse().find(e => e.type === 'IN');
      if (lastIn) {
        const lastInTime = typeof lastIn.timestamp === 'number' ? lastIn.timestamp : new Date(lastIn.timestamp).getTime();
        const elapsedSeconds = Math.floor((now - lastInTime) / 1000);
        setLiveWorkSeconds(Math.max(0, elapsedSeconds));
      } else {
        setLiveWorkSeconds(0);
      }
      setLiveBreakSeconds(0);
    } else if (currentStatus === 'OUT' && entries.length > 0) {
      // Find the last OUT entry
      const lastOut = [...entries].reverse().find(e => e.type === 'OUT');
      if (lastOut) {
        const lastOutTime = typeof lastOut.timestamp === 'number' ? lastOut.timestamp : new Date(lastOut.timestamp).getTime();
        const elapsedSeconds = Math.floor((now - lastOutTime) / 1000);
        setLiveBreakSeconds(Math.max(0, elapsedSeconds));
      } else {
        setLiveBreakSeconds(0);
      }
      setLiveWorkSeconds(0);
    } else {
      setLiveWorkSeconds(0);
      setLiveBreakSeconds(0);
    }
  }, [sessionData]);

  // Calculate daily stats from entries
  const calculateDailyStats = useCallback(() => {
    if (!sessionData || !sessionData.entries || sessionData.entries.length === 0) {
      return {
        totalWorkMinutes: 0,
        totalBreakMinutes: 0,
        isComplete: false
      };
    }

    const entries = sessionData.entries;
    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;

    // Calculate completed work sessions (IN followed by OUT)
    for (let i = 0; i < entries.length - 1; i += 2) {
      if (entries[i].type === 'IN' && entries[i + 1]?.type === 'OUT') {
        const t1 = typeof entries[i].timestamp === 'number' ? entries[i].timestamp : new Date(entries[i].timestamp).getTime();
        const t2 = typeof entries[i + 1].timestamp === 'number' ? entries[i + 1].timestamp : new Date(entries[i + 1].timestamp).getTime();
        const workMinutes = (t2 - t1) / (1000 * 60);
        totalWorkMinutes += workMinutes;
      }
    }

    // Add current session time if working
    if (sessionData.currentStatus === 'IN' && liveWorkSeconds > 0) {
      totalWorkMinutes += liveWorkSeconds / 60;
    }

    // Calculate break times (OUT followed by IN)
    for (let i = 1; i < entries.length - 1; i += 2) {
      if (entries[i].type === 'OUT' && entries[i + 1]?.type === 'IN') {
        const t1 = typeof entries[i].timestamp === 'number' ? entries[i].timestamp : new Date(entries[i].timestamp).getTime();
        const t2 = typeof entries[i + 1].timestamp === 'number' ? entries[i + 1].timestamp : new Date(entries[i + 1].timestamp).getTime();
        const breakMinutes = (t2 - t1) / (1000 * 60);
        totalBreakMinutes += breakMinutes;
      }
    }

    // Add current break time if on break
    if (sessionData.currentStatus === 'OUT' && liveBreakSeconds > 0 && entries.length > 0) {
      totalBreakMinutes += liveBreakSeconds / 60;
    }

    const isComplete = totalWorkMinutes >= 480; // 8 hours

    return {
      totalWorkMinutes: Math.round(totalWorkMinutes),
      totalBreakMinutes: Math.round(totalBreakMinutes),
      isComplete
    };
  }, [sessionData, liveWorkSeconds, liveBreakSeconds]);

  // Update live timers every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      calculateLiveTimers();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [calculateLiveTimers]);

  // Update daily stats when timers change
  useEffect(() => {
    if (sessionData && updateSessionData) {
      const newStats = calculateDailyStats();
      
      // Only update if stats have changed to avoid unnecessary saves
      if (JSON.stringify(newStats) !== JSON.stringify(sessionData.dailyStats)) {
        updateSessionData({
          dailyStats: newStats
        });
      }
    }
  }, [liveWorkSeconds, liveBreakSeconds, sessionData, updateSessionData, calculateDailyStats]);

  // Initialize timers when sessionData changes
  useEffect(() => {
    calculateLiveTimers();
  }, [calculateLiveTimers]);

  // Clock in function
  const clockIn = useCallback(() => {
    if (!sessionData || !updateSessionData) return;

    const now = new Date();
    const newEntry = {
      id: Date.now(),
      timestamp: now.getTime(),
      type: 'IN',
      time: now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };

    const updatedEntries = [...(sessionData.entries || []), newEntry];
    
    updateSessionData({
      currentStatus: 'IN',
      entries: updatedEntries,
      sessionStartTime: now.getTime()
    }, true); // Save immediately
  }, [sessionData, updateSessionData]);

  // Clock out function
  const clockOut = useCallback(() => {
    if (!sessionData || !updateSessionData) return;

    const now = new Date();
    const newEntry = {
      id: Date.now(),
      timestamp: now.getTime(),
      type: 'OUT',
      time: now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };

    const updatedEntries = [...(sessionData.entries || []), newEntry];
    
    updateSessionData({
      currentStatus: 'OUT',
      entries: updatedEntries,
      sessionStartTime: null
    }, true); // Save immediately
  }, [sessionData, updateSessionData]);

  // Helper functions
  const formatSecondsToHMS = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  }, []);

  const formatMinutesToHours = useCallback((minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (!sessionData || !sessionData.dailyStats) return 0;
    const percentage = Math.min((sessionData.dailyStats.totalWorkMinutes / 480) * 100, 100);
    return Math.round(percentage * 10) / 10;
  }, [sessionData]);

  const getRemainingTime = useCallback(() => {
    if (!sessionData || !sessionData.dailyStats) return '8h 0m';
    const remaining = 480 - sessionData.dailyStats.totalWorkMinutes;
    return remaining > 0 ? formatMinutesToHours(remaining) : '0h 0m';
  }, [sessionData, formatMinutesToHours]);

  return {
    liveWorkSeconds,
    liveBreakSeconds,
    clockIn,
    clockOut,
    formatSecondsToHMS,
    formatMinutesToHours,
    getProgressPercentage,
    getRemainingTime,
    dailyStats: sessionData?.dailyStats || { totalWorkMinutes: 0, totalBreakMinutes: 0, isComplete: false }
  };
};
