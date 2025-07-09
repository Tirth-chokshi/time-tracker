"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Coffee, 
  Activity, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Timer,
  BarChart2,
  CheckCircle,
  X
} from 'lucide-react';

const LogsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchLogs(currentPage);
    }
  }, [session, currentPage]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-logs?page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch logs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressPercentage = (totalWorkMinutes) => {
    return Math.min((totalWorkMinutes / 480) * 100, 100);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openLogDetails = (log) => {
    setSelectedLog(log);
  };

  const closeLogDetails = () => {
    setSelectedLog(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tracker</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            <span>Daily Logs</span>
          </h1>
        </div>

        {/* Logs Grid */}
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No logs found</h3>
            <p className="text-slate-500">Start tracking your time to see your daily logs here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openLogDetails(log)}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">
                      {new Date(log.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {log.dailyStats.isComplete && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-600">Work Time</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatMinutesToHours(log.dailyStats.totalWorkMinutes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-600">Break Time</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatMinutesToHours(log.dailyStats.totalBreakMinutes)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(getProgressPercentage(log.dailyStats.totalWorkMinutes))}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(log.dailyStats.totalWorkMinutes)}%` }}
                      />
                    </div>
                  </div>

                  {/* Entry Count */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-purple-600" />
                      <span className="text-slate-600">Entries</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {log.entries.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {formatDate(selectedLog.date)}
              </h3>
              <button
                onClick={closeLogDetails}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatMinutesToHours(selectedLog.dailyStats.totalWorkMinutes)}
                  </div>
                  <div className="text-sm text-slate-600">Work Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {formatMinutesToHours(selectedLog.dailyStats.totalBreakMinutes)}
                  </div>
                  <div className="text-sm text-slate-600">Break Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {selectedLog.entries.length}
                  </div>
                  <div className="text-sm text-slate-600">Entries</div>
                </div>
              </div>

              {/* Time Entries */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Time Entries</h4>
                <div className="space-y-2">
                  {selectedLog.entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.type === 'IN' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium text-slate-900">
                          {entry.type === 'IN' ? 'Clock In' : 'Clock Out'}
                        </span>
                      </div>
                      <span className="text-slate-600 font-mono">
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
