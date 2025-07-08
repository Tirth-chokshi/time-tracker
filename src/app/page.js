"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckCircle, Coffee, Activity, Timer, Target, BarChart2, Sparkles, Moon, CircleDot } from 'lucide-react';

const WorkHoursTracker = () => {
  const [entries, setEntries] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('OUT');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('minimal');
  const [dailyStats, setDailyStats] = useState({
    totalWorkMinutes: 0,
    totalBreakMinutes: 0,
    isComplete: false
  });

  const themes = {
    minimal: {
      name: 'Minimal',
      icon: <CircleDot className="w-5 h-5" />,
      bg: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
      pattern: 'bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.05),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.05),_transparent_50%)]',
      surface: 'bg-white/80 backdrop-blur-xl shadow-soft border border-white/20',
      surfaceHover: 'hover:shadow-medium hover:border-white/30 hover:bg-white/90',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-700',
      textMuted: 'text-slate-500',
      accent: 'text-blue-600',
      clockIn: 'bg-gradient-success shadow-lg hover:shadow-xl',
      clockOut: 'bg-gradient-danger shadow-lg hover:shadow-xl',
      workCard: 'bg-gradient-blue shadow-lg',
      breakCard: 'bg-gradient-amber shadow-lg',
      remainingCard: 'bg-gradient-purple shadow-lg'
    },
    aurora: {
      name: 'Aurora',
      icon: <Sparkles className="w-5 h-5" />,
      bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
      pattern: 'bg-[radial-gradient(circle_at_30%_70%,_rgba(168,85,247,0.1),_transparent_50%),radial-gradient(circle_at_70%_30%,_rgba(236,72,153,0.1),_transparent_50%)]',
      surface: 'bg-white/70 backdrop-blur-xl shadow-medium border border-purple-100/50',
      surfaceHover: 'hover:shadow-large hover:border-purple-200/50 hover:bg-white/80',
      textPrimary: 'text-purple-900',
      textSecondary: 'text-purple-700',
      textMuted: 'text-purple-500',
      accent: 'text-pink-600',
      clockIn: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:shadow-xl',
      clockOut: 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg hover:shadow-xl',
      workCard: 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg',
      breakCard: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg',
      remainingCard: 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg'
    },
    dark: {
      name: 'Dark',
      icon: <Moon className="w-5 h-5" />,
      bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
      pattern: 'bg-[radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.1),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.1),_transparent_50%)]',
      surface: 'bg-slate-800/80 backdrop-blur-xl shadow-large border border-slate-700/50',
      surfaceHover: 'hover:shadow-xl hover:border-slate-600/50 hover:bg-slate-800/90',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accent: 'text-blue-400',
      clockIn: 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg hover:shadow-xl',
      clockOut: 'bg-gradient-to-r from-red-500 to-rose-500 shadow-lg hover:shadow-xl',
      workCard: 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg',
      breakCard: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg',
      remainingCard: 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg'
    }
  };

  const theme = themes[currentTheme];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDailyStats = useCallback(() => {
    if (entries.length === 0) {
      setDailyStats({ totalWorkMinutes: 0, totalBreakMinutes: 0, isComplete: false });
      return;
    }

    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;

    for (let i = 0; i < entries.length - 1; i += 2) {
      if (entries[i].type === 'IN' && entries[i + 1]?.type === 'OUT') {
        const workMinutes = (entries[i + 1].timestamp - entries[i].timestamp) / (1000 * 60);
        totalWorkMinutes += workMinutes;
      }
    }

    for (let i = 1; i < entries.length - 1; i += 2) {
      if (entries[i].type === 'OUT' && entries[i + 1]?.type === 'IN') {
        const breakMinutes = (entries[i + 1].timestamp - entries[i].timestamp) / (1000 * 60);
        totalBreakMinutes += breakMinutes;
      }
    }

    const isComplete = totalWorkMinutes >= 480;

    setDailyStats({
      totalWorkMinutes: Math.round(totalWorkMinutes),
      totalBreakMinutes: Math.round(totalBreakMinutes),
      isComplete
    });
  }, [entries]);

  // Calculate daily stats whenever entries change
  useEffect(() => {
    calculateDailyStats();
  }, [entries, calculateDailyStats]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleThumbPress = () => {
    if (currentStatus === 'IN') {
      setShowBreakDialog(true);
    } else {
      clockIn();
    }
  };

  const clockIn = () => {
    const now = new Date();
    const newEntry = {
      id: Date.now(),
      timestamp: now,
      type: 'IN',
      time: formatTime(now)
    };

    setEntries(prev => [...prev, newEntry]);
    setCurrentStatus('IN');
  };

  const clockOut = () => {
    const now = new Date();
    const newEntry = {
      id: Date.now(),
      timestamp: now,
      type: 'OUT',
      time: formatTime(now)
    };

    setEntries(prev => [...prev, newEntry]);
    setCurrentStatus('OUT');
  };

  const handleBreakResponse = (isBreak) => {
    clockOut();
    setShowBreakDialog(false);
    
    if (!isBreak) {
      console.log('Day ended');
    }
  };

  const resetDay = () => {
    setEntries([]);
    setCurrentStatus('OUT');
    setDailyStats({ totalWorkMinutes: 0, totalBreakMinutes: 0, isComplete: false });
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressPercentage = () => {
    return Math.min((dailyStats.totalWorkMinutes / 480) * 100, 100);
  };

  const getRemainingTime = () => {
    const remaining = 480 - dailyStats.totalWorkMinutes;
    return remaining > 0 ? formatMinutesToHours(remaining) : '0h 0m';
  };

  // Enhanced circular progress component
  const CircularProgress = ({ percentage, size = 140 }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 progress-ring"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${theme.textPrimary}`}>
              {Math.round(percentage)}%
            </div>
            <div className={`text-sm ${theme.textMuted} font-medium`}>Complete</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.bg}`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 ${theme.pattern}`}></div>
      
      {/* Mobile-First Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <header className={`${theme.surface} ${theme.surfaceHover} backdrop-blur-xl sticky top-0 z-40 border-b border-white/10`}>
          <div className="safe-area-padding px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary p-3 rounded-2xl animate-glow shadow-lg">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${theme.textPrimary} tracking-tight`}>TimeTracker</h1>
                  <p className={`text-sm ${theme.textMuted} font-medium`}>Work Session Manager</p>
                </div>
              </div>
              
              {/* Time Display */}
              <div className={`${theme.surface} rounded-2xl px-4 py-3 shadow-soft border border-white/20`}>
                <div className={`text-lg font-mono font-bold ${theme.textPrimary} tracking-wider`}>
                  {formatTime(currentTime)}
                </div>
                <div className={`text-xs ${theme.textMuted} text-center font-medium mt-0.5`}>
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center justify-center mt-4 space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {Object.entries(themes).map(([key, themeOption]) => (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 min-w-max touch-action ${
                    currentTheme === key
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : `${theme.surface} ${theme.textMuted} ${theme.surfaceHover} border border-white/10`
                  }`}
                >
                  {themeOption.icon}
                  <span className="text-sm font-medium">{themeOption.name}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-6 pb-safe">
          {/* Status Banner */}
          <div className={`${theme.surface} ${theme.surfaceHover} rounded-3xl p-5 animate-scale-in shadow-medium border border-white/10`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-full shadow-lg ${
                  currentStatus === 'IN' 
                    ? 'bg-gradient-success text-white' 
                    : 'bg-gradient-danger text-white'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    currentStatus === 'IN' ? 'bg-green-200' : 'bg-red-200'
                  } animate-pulse`}></div>
                  <span className="text-sm font-semibold tracking-wide">
                    {currentStatus === 'IN' ? 'Working Now' : 'Offline'}
                  </span>
                </div>
                {dailyStats.isComplete && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-full shadow-lg animate-bounce-soft">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-semibold">Goal Achieved!</span>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={resetDay}
                className={`${theme.surface} ${theme.textSecondary} ${theme.surfaceHover} px-5 py-2.5 rounded-xl flex items-center space-x-2 hover-lift active:scale-95 border border-white/10 shadow-soft touch-action`}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-semibold">Reset Day</span>
              </button>
            </div>
          </div>

          {/* Clock and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Clock Card */}
            <div className="lg:col-span-2">
              <div className={`${theme.surface} ${theme.surfaceHover} rounded-3xl p-8 text-center animate-float shadow-large border border-white/10`}>
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Time Clock</h2>
                  <p className={`text-sm ${theme.textMuted} font-medium`}>
                    {currentStatus === 'OUT' ? 'Ready to start your work session' : 'Session in progress'}
                  </p>
                </div>
                
                <div className="flex justify-center mb-8">
                  <CircularProgress percentage={getProgressPercentage()} size={160} />
                </div>
                
                <button
                  onClick={handleThumbPress}
                  className={`clock-button w-full ${
                    currentStatus === 'OUT' ? theme.clockIn : theme.clockOut
                  } rounded-2xl py-4 text-lg font-bold tracking-wide touch-action`}
                >
                  {currentStatus === 'OUT' ? (
                    <>
                      <Play className="w-7 h-7" />
                      <span>Start Work</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-7 h-7" />
                      <span>End Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-3 space-y-6">
              {/* Progress Overview */}
              <div className={`${theme.surface} ${theme.surfaceHover} rounded-3xl p-6 shadow-large border border-white/10`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-primary p-2.5 rounded-xl">
                      <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Daily Progress</h3>
                      <p className={`text-sm ${theme.textMuted} font-medium`}>8-hour work goal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${theme.textPrimary}`}>
                      {Math.round(getProgressPercentage())}%
                    </div>
                    <div className={`text-xs ${theme.textMuted} font-medium`}>Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-4 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                        dailyStats.isComplete ? 'bg-gradient-success' : 'bg-gradient-primary'
                      }`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-2xl bg-white/30 backdrop-blur-sm">
                    <div className={`text-xl font-bold ${theme.textPrimary}`}>
                      {formatMinutesToHours(dailyStats.totalWorkMinutes)}
                    </div>
                    <div className={`text-xs ${theme.textMuted} font-semibold`}>Work Time</div>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white/30 backdrop-blur-sm">
                    <div className={`text-xl font-bold ${theme.textPrimary}`}>
                      {formatMinutesToHours(dailyStats.totalBreakMinutes)}
                    </div>
                    <div className={`text-xs ${theme.textMuted} font-semibold`}>Break Time</div>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white/30 backdrop-blur-sm">
                    <div className={`text-xl font-bold ${theme.textPrimary}`}>
                      {getRemainingTime()}
                    </div>
                    <div className={`text-xs ${theme.textMuted} font-semibold`}>Remaining</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`stat-card ${theme.workCard} text-white rounded-3xl shadow-large border border-white/10`}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <Timer className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Total Work</p>
                      <p className="text-xl font-bold tracking-tight">
                        {formatMinutesToHours(dailyStats.totalWorkMinutes)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`stat-card ${theme.breakCard} text-white rounded-3xl shadow-large border border-white/10`}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <Coffee className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Break Time</p>
                      <p className="text-xl font-bold tracking-tight">
                        {formatMinutesToHours(dailyStats.totalBreakMinutes)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`stat-card ${theme.remainingCard} text-white rounded-3xl shadow-large border border-white/10`}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Remaining</p>
                      <p className="text-xl font-bold tracking-tight">
                        {getRemainingTime()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className={`${theme.surface} ${theme.surfaceHover} rounded-3xl p-6 shadow-large border border-white/10`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary p-2.5 rounded-xl shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Activity Timeline</h3>
                  <p className={`text-sm ${theme.textMuted} font-medium`}>Today&apos;s work sessions</p>
                </div>
              </div>
              <div className={`text-sm ${theme.textMuted} font-medium`}>
                {entries.length > 0 ? `${Math.ceil(entries.length / 2)} sessions` : 'No sessions'}
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-16">
                <div className={`${theme.surface} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-soft border border-white/10`}>
                  <Clock className={`w-10 h-10 ${theme.textMuted}`} />
                </div>
                <p className={`${theme.textPrimary} text-lg font-semibold mb-2`}>No activity yet</p>
                <p className={`${theme.textMuted} text-sm`}>Start your first work session by clocking in</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`timeline-item flex items-center space-x-4 p-4 rounded-2xl ${theme.surface} border border-white/10 hover:${theme.surfaceHover} transition-all duration-200`}
                  >
                    <div className={`w-4 h-4 rounded-full ${
                      entry.type === 'IN' ? 'bg-gradient-success' : 'bg-gradient-danger'
                    } shadow-lg animate-pulse`}></div>
                    <div className="flex-1">
                      <div className={`font-semibold ${theme.textPrimary}`}>
                        {entry.type === 'IN' ? 'Started Work Session' : 'Ended Work Session'}
                      </div>
                      <div className={`text-sm ${theme.textMuted} font-medium`}>
                        Session #{Math.floor(index / 2) + 1} • {entry.type === 'IN' ? 'Clock In' : 'Clock Out'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${theme.textPrimary} text-lg`}>
                        {entry.time}
                      </div>
                      <div className={`text-xs ${theme.textMuted} font-medium uppercase tracking-wide`}>
                        {entry.type === 'IN' ? 'Started' : 'Ended'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Break Dialog */}
      {showBreakDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-lg">
          <div className={`${theme.surface} rounded-t-3xl sm:rounded-3xl p-8 w-full sm:max-w-md animate-scale-in shadow-2xl border border-white/20`}>
            <div className="text-center mb-8">
              <div className="bg-gradient-warning p-5 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-bounce-soft shadow-lg">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-3`}>Session Complete</h3>
              <p className={`${theme.textSecondary} font-medium`}>What would you like to do next?</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleBreakResponse(true)}
                className="w-full bg-gradient-warning text-white font-semibold py-4 px-6 rounded-2xl hover-lift active:scale-95 shadow-lg border border-white/20 touch-action"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Coffee className="w-5 h-5" />
                  <span>Take a Break</span>
                </div>
              </button>
              <button
                onClick={() => handleBreakResponse(false)}
                className="w-full bg-gradient-danger text-white font-semibold py-4 px-6 rounded-2xl hover-lift active:scale-95 shadow-lg border border-white/20 touch-action"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>End Work Day</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHoursTracker;
