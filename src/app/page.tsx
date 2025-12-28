'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Timer, BarChart3, Settings, Bell, Search, User, X } from 'lucide-react';
import TodoList from '@/components/TodoList';
import DailyFocus from '@/components/DailyFocus';
import PomodoroTimer from '@/components/PomodoroTimer';
import MotivationalQuote from '@/components/MotivationalQuote';

const ACTIVITY_KEY = 'zenflow-weekly-activity';

interface DailyActivity {
  sessions: number;
  focusMinutes: number;
  tasksCompleted: number;
}

type WeeklyData = { [key: string]: DailyActivity };

const getDayKey = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

const getWeekDays = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(getDayKey(date));
  }
  return days;
};

export default function Home() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({});
  const [totalFocus, setTotalFocus] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeView, setActiveView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'focus', icon: Timer, label: 'Focus' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'settings') {
      setShowSettings(true);
    } else {
      setActiveView(id);
    }
  };

  // Load weekly activity data
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(ACTIVITY_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setWeeklyData(data);

          const weekDays = getWeekDays();
          let focus = 0, tasks = 0, sessions = 0;
          weekDays.forEach(day => {
            if (data[day]) {
              focus += data[day].focusMinutes || 0;
              tasks += data[day].tasksCompleted || 0;
              sessions += data[day].sessions || 0;
            }
          });
          setTotalFocus(focus);
          setTotalTasks(tasks);
          setTotalSessions(sessions);
        } catch (e) {
          console.error('Failed to parse activity:', e);
        }
      }

      const pomodoroData = localStorage.getItem('zenflow-pomodoro');
      const todosData = localStorage.getItem('zenflow-todos');
      const today = getDayKey();

      const currentData: WeeklyData = stored ? JSON.parse(stored) : {};
      if (!currentData[today]) {
        currentData[today] = { sessions: 0, focusMinutes: 0, tasksCompleted: 0 };
      }

      if (pomodoroData) {
        const pomo = JSON.parse(pomodoroData);
        const settings = localStorage.getItem('zenflow-timer-settings');
        const workDuration = settings ? JSON.parse(settings).workDuration : 25;
        currentData[today].sessions = pomo.sessions || 0;
        currentData[today].focusMinutes = (pomo.sessions || 0) * workDuration;
      }

      if (todosData) {
        const todos = JSON.parse(todosData);
        currentData[today].tasksCompleted = todos.filter((t: { completed: boolean }) => t.completed).length;
      }

      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(currentData));
      setWeeklyData(currentData);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const weekDays = getWeekDays();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const maxTasks = Math.max(
    ...weekDays.map(day => weeklyData[day]?.tasksCompleted || 0),
    5
  );

  const clearAllData = () => {
    localStorage.removeItem('zenflow-todos');
    localStorage.removeItem('zenflow-pomodoro');
    localStorage.removeItem('zenflow-timer-settings');
    localStorage.removeItem('zenflow-calendar-events');
    localStorage.removeItem(ACTIVITY_KEY);
    window.location.reload();
  };

  // Get page title based on active view
  const getPageTitle = () => {
    switch (activeView) {
      case 'tasks': return 'My Tasks';
      case 'calendar': return 'Calendar';
      case 'focus': return 'Focus Timer';
      case 'analytics': return 'Analytics';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-1">App Version</h3>
                <p className="text-sm text-gray-500">ZenFlow v1.0.0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-1">Data Storage</h3>
                <p className="text-sm text-gray-500 mb-3">All data is stored locally in your browser</p>
                <button onClick={clearAllData} className="text-sm text-red-500 hover:text-red-600 font-medium">
                  Clear All Data
                </button>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="btn-primary w-full mt-6">Done</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-6 fixed h-full animate-slide-in-left z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-green-600">ZenFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-green-50 text-green-600 font-semibold border-l-4 border-green-500' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">User</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-lg gradient-text">ZenFlow</span>
            </div>

            {/* Page Title */}
            <h1 className="hidden lg:block text-xl font-bold text-gray-800">{getPageTitle()}</h1>

            {/* Mobile user avatar */}
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center lg:hidden">
              <User className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Dashboard View - Shows all */}
          {activeView === 'dashboard' && (
            <>
              <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <svg viewBox="0 0 80 80" className="w-16 h-16 animate-float">
                      <defs>
                        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2ecc71"/>
                          <stop offset="100%" stopColor="#58d68d"/>
                        </linearGradient>
                      </defs>
                      <circle cx="40" cy="40" r="35" fill="none" stroke="url(#waveGrad)" strokeWidth="2" strokeOpacity="0.3"/>
                      <circle cx="40" cy="40" r="25" fill="none" stroke="url(#waveGrad)" strokeWidth="2" strokeOpacity="0.5"/>
                      <circle cx="40" cy="40" r="15" fill="url(#waveGrad)" fillOpacity="0.2"/>
                      <text x="40" y="46" textAnchor="middle" fontSize="24">👋</text>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Good Afternoon, User 👋</h1>
                    <p className="text-gray-500 text-base">Here&apos;s your productivity overview for today</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:row-span-2 min-h-[500px] animate-fade-in-up animate-delay-100">
                  <TodoList />
                </div>
                <div className="min-h-[400px] animate-fade-in-up animate-delay-200">
                  <DailyFocus />
                </div>
                <div className="min-h-[400px] animate-fade-in-up animate-delay-300">
                  <PomodoroTimer />
                </div>
                <div className="lg:col-span-2 animate-fade-in-up animate-delay-400">
                  <MotivationalQuote />
                </div>
                <div className="lg:col-span-3 card card-hover-lift p-6 animate-fade-in-up animate-delay-400">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500">
                          <path fill="currentColor" d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-6h2v17h-2V4zm4 4h2v13h-2V8z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Weekly Insights</h3>
                    </div>
                    <span className="text-sm text-gray-400">Tasks completed per day</span>
                  </div>
                  <div className="flex items-end justify-between gap-3 h-36 px-2">
                    {weekDays.map((day, i) => {
                      const tasks = weeklyData[day]?.tasksCompleted || 0;
                      // Fixed scale: 1 task = 28px (144px / 5 = ~28px per unit)
                      const heightPx = Math.min(tasks * 28, 144);
                      const isToday = day === getDayKey();
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2 justify-end">
                          <div className="text-xs text-gray-600 font-semibold">{tasks > 0 ? tasks : '-'}</div>
                          <div
                            className={`w-full min-w-[20px] rounded-t-lg transition-all duration-500
                              ${isToday ? 'bg-green-500' : tasks > 0 ? 'bg-green-400' : 'bg-gray-700'}`}
                            style={{ height: `${tasks > 0 ? heightPx : 8}px` }}
                          />
                          <span className={`text-xs font-medium ${isToday ? 'text-green-400' : 'text-gray-500'}`}>{dayLabels[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center p-3 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition-all duration-300 group">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-500">
                          <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{totalFocus >= 60 ? `${(totalFocus / 60).toFixed(1)}h` : `${totalFocus}m`}</p>
                      <p className="text-sm text-gray-500">Total Focus</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-all duration-300 group">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-500">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{totalTasks}</p>
                      <p className="text-sm text-gray-500">Tasks Done</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300 group">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-orange-500">
                          <path fill="currentColor" d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-orange-500">{totalSessions}</p>
                      <p className="text-sm text-gray-500">Sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tasks View - Tasks + Chart */}
          {activeView === 'tasks' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <TodoList />

              {/* Task Completion Chart */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">Tasks Completed</h3>

                <div className="flex">
                  {/* Y-Axis */}
                  <div className="flex flex-col justify-between h-48 pr-3 text-right">
                    {[5, 4, 3, 2, 1, 0].map((value) => (
                      <span key={value} className="text-xs text-gray-500">{value}</span>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1">
                    <div className="flex items-end justify-around h-48 border-l border-b border-gray-200 px-2">
                      {weekDays.map((day, i) => {
                        const tasks = weeklyData[day]?.tasksCompleted || 0;
                        // Fixed scale: 1 task = 38px (192px / 5 = ~38px per unit)
                        const heightPx = Math.min(tasks * 38, 192);
                        const isToday = day === getDayKey();

                        return (
                          <div key={day} className="flex flex-col items-center justify-end h-full" style={{ width: '12%' }}>
                            <div
                              className={`w-full rounded-t transition-all duration-500 ${isToday ? 'bg-blue-500' : 'bg-blue-400'}`}
                              style={{ height: `${heightPx}px` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-around mt-2 px-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const isToday = weekDays[i] === getDayKey();
                        return (
                          <span key={day} className={`text-xs ${isToday ? 'text-blue-400 font-bold' : 'text-gray-500'}`} style={{ width: '12%', textAlign: 'center' }}>
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* X-Axis Title */}
                <p className="text-center text-sm text-gray-500 mt-4">Day of the Week</p>
              </div>
            </div>
          )}

          {/* Calendar View - Only Calendar */}
          {activeView === 'calendar' && (
            <div className="max-w-2xl mx-auto">
              <DailyFocus />
            </div>
          )}

          {/* Focus View - Only Timer */}
          {activeView === 'focus' && (
            <div className="max-w-md mx-auto">
              <PomodoroTimer />
            </div>
          )}

          {/* Analytics View - Full Analytics */}
          {activeView === 'analytics' && (
            <div className="max-w-4xl mx-auto">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Weekly Insights</h3>
                  <span className="text-sm text-gray-400">Tasks completed per day</span>
                </div>
                <div className="flex items-end justify-between gap-4 h-48 px-4">
                  {weekDays.map((day, i) => {
                    const tasks = weeklyData[day]?.tasksCompleted || 0;
                    const height = maxTasks > 0 ? (tasks / maxTasks) * 160 : 0;
                    const isToday = day === getDayKey();
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-sm text-gray-700 font-bold">{tasks > 0 ? tasks : '-'}</div>
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500
                            ${isToday ? 'bg-gradient-to-t from-green-600 to-green-400' : tasks > 0 ? 'bg-gradient-to-t from-green-400 to-green-300' : 'bg-gray-100'}`}
                          style={{ height: `${Math.max(height, 12)}px` }}
                        />
                        <span className={`text-sm font-medium ${isToday ? 'text-green-600' : 'text-gray-500'}`}>{dayLabels[i]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-3xl font-bold text-purple-600">{totalFocus >= 60 ? `${(totalFocus / 60).toFixed(1)}h` : `${totalFocus}m`}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Focus Time</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{totalTasks}</p>
                    <p className="text-sm text-gray-600 mt-1">Tasks Completed</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-3xl font-bold text-orange-500">{totalSessions}</p>
                    <p className="text-sm text-gray-600 mt-1">Focus Sessions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
