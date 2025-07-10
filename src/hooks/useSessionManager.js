import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export const useSessionManager = () => {
  const { data: session, status } = useSession();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Fetch session data from server
  const fetchSessionData = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/session');
      if (response.ok) {
        const data = await response.json();
        setSessionData(data.data);
        setError(null);
      } else {
        throw new Error('Failed to fetch session data');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Save session data to server with debouncing
  const saveSessionData = useCallback(async (data, immediate = false) => {
    if (!session || !data) return;

    const performSave = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save session data');
        }

        const result = await response.json();
        setSessionData(result.data);
        setError(null);
        return result;
      } catch (error) {
        console.error('Error saving session:', error);
        setError(error.message);
        throw error;
      }
    };

    if (immediate) {
      return performSave();
    } else {
      // Debounce saves to avoid too many requests
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        performSave();
      }, 2000); // Save after 2 seconds of inactivity
    }
  }, [session]);

  // Reset session
  const resetSession = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/session', {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSessionData(); // Refresh data
        setError(null);
      } else {
        throw new Error('Failed to reset session');
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      setError(error.message);
    }
  }, [session, fetchSessionData]);

  // Update session data locally and save to server
  const updateSessionData = useCallback((updates, saveImmediately = false) => {
    setSessionData(prev => {
      const newData = { ...prev, ...updates };
      saveSessionData(newData, saveImmediately);
      return newData;
    });
  }, [saveSessionData]);

  // Initialize session on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessionData();
    } else if (status === 'unauthenticated') {
      setSessionData(null);
      setIsLoading(false);
    }
  }, [status, fetchSessionData]);

  // Auto-sync session data every 30 seconds and send heartbeat
  useEffect(() => {
    if (session && sessionData) {
      intervalRef.current = setInterval(() => {
        // Send heartbeat to keep session alive
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: Date.now()
          }),
        }).catch(console.error);

        // Sync session data every 2 minutes
        if (Math.random() < 0.25) { // 25% chance every 30 seconds = once every 2 minutes on average
          fetchSessionData();
        }
      }, 30000); // Every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [session, sessionData, fetchSessionData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save session data when the page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionData) {
        // Use navigator.sendBeacon for reliable data sending on page unload
        navigator.sendBeacon('/api/session', JSON.stringify(sessionData));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionData) {
        // Save immediately when tab becomes hidden
        saveSessionData(sessionData, true);
      } else if (document.visibilityState === 'visible') {
        // Fetch latest data when tab becomes visible
        fetchSessionData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionData, saveSessionData, fetchSessionData]);

  return {
    sessionData,
    isLoading,
    error,
    updateSessionData,
    resetSession,
    refetchSession: fetchSessionData,
    saveSessionData,
  };
};
