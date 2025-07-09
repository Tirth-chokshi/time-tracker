"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CircleDot, Sparkles, Moon } from 'lucide-react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
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
    remainingCard: 'bg-gradient-purple shadow-lg',
    button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
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
    remainingCard: 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg',
    button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
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
    remainingCard: 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg',
    button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('minimal');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('timetracker-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('timetracker-theme', currentTheme);
  }, [currentTheme]);

  const theme = themes[currentTheme];

  const value = {
    currentTheme,
    setCurrentTheme,
    theme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
