'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Timer, Settings, X } from 'lucide-react';

type TimerMode = 'work' | 'break';

const STORAGE_KEY = 'zenflow-pomodoro';
const SETTINGS_KEY = 'zenflow-timer-settings';

interface TimerState {
    timeRemaining: number;
    mode: TimerMode;
    isRunning: boolean;
    sessions: number;
}

interface TimerSettings {
    workDuration: number;
    breakDuration: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
    workDuration: 25,
    breakDuration: 5,
};

export default function PomodoroTimer() {
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_SETTINGS.workDuration * 60);
    const [mode, setMode] = useState<TimerMode>('work');
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [tempSettings, setTempSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                setSettings(parsed);
                setTempSettings(parsed);
                setTimeRemaining(parsed.workDuration * 60);
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const state: TimerState = JSON.parse(stored);
                setTimeRemaining(state.timeRemaining);
                setMode(state.mode);
                setSessions(state.sessions);
            } catch (e) {
                console.error('Failed to parse timer state:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const state: TimerState = { timeRemaining, mode, isRunning, sessions };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [timeRemaining, mode, isRunning, sessions, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    if (mode === 'work') {
                        setSessions(s => s + 1);
                        setMode('break');
                        return settings.breakDuration * 60;
                    } else {
                        setMode('work');
                        return settings.workDuration * 60;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, mode, settings]);

    const toggleTimer = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeRemaining(mode === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60);
    }, [mode, settings]);

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeRemaining(newMode === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60);
        setIsRunning(false);
    };

    const saveSettings = () => {
        setSettings(tempSettings);
        setTimeRemaining(mode === 'work' ? tempSettings.workDuration * 60 : tempSettings.breakDuration * 60);
        setIsRunning(false);
        setShowSettings(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalDuration = mode === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60;
    const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

    const size = 180;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const presets = [
        { label: '15 min', work: 15, break: 3 },
        { label: '25 min', work: 25, break: 5 },
        { label: '45 min', work: 45, break: 10 },
        { label: '60 min', work: 60, break: 15 },
    ];

    return (
        <div className="card p-5 h-full flex flex-col overflow-hidden relative">
            {/* Settings Modal - Full overlay */}
            {showSettings && (
                <div className="absolute inset-0 bg-white z-50 p-5 flex flex-col rounded-2xl">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-gray-800">Timer Settings</h3>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Presets */}
                    <div className="mb-5">
                        <p className="text-sm text-gray-500 mb-3">Quick Presets</p>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => setTempSettings({ workDuration: preset.work, breakDuration: preset.break })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all
                    ${tempSettings.workDuration === preset.work
                                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                            : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Duration */}
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">Focus Duration (minutes)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={tempSettings.workDuration}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setTempSettings(prev => ({ ...prev, workDuration: val === '' ? 0 : parseInt(val) }));
                                }}
                                onBlur={(e) => {
                                    let val = parseInt(e.target.value) || 1;
                                    if (val < 1) val = 1;
                                    if (val > 120) val = 120;
                                    setTempSettings(prev => ({ ...prev, workDuration: val }));
                                }}
                                className="input-field w-full text-center text-2xl font-bold py-4"
                                placeholder="25"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">Break Duration (minutes)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={tempSettings.breakDuration}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setTempSettings(prev => ({ ...prev, breakDuration: val === '' ? 0 : parseInt(val) }));
                                }}
                                onBlur={(e) => {
                                    let val = parseInt(e.target.value) || 1;
                                    if (val < 1) val = 1;
                                    if (val > 60) val = 60;
                                    setTempSettings(prev => ({ ...prev, breakDuration: val }));
                                }}
                                className="input-field w-full text-center text-2xl font-bold py-4"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <button
                        onClick={saveSettings}
                        className="btn-primary w-full mt-4"
                    >
                        Save Settings
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-purple-600" />
                    Focus Timer
                </h2>
                <div className="flex items-center gap-1">
                    <div className="badge badge-green text-xs">
                        <Zap className="w-3 h-3" />
                        {sessions}
                    </div>
                    <button
                        onClick={() => { setTempSettings(settings); setShowSettings(true); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Timer settings"
                    >
                        <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Mode Toggle */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => switchMode('work')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1
              ${mode === 'work' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                    >
                        <Zap className="w-3 h-3" />
                        Focus
                    </button>
                    <button
                        onClick={() => switchMode('break')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1
              ${mode === 'break' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                    >
                        <Coffee className="w-3 h-3" />
                        Break
                    </button>
                </div>

                {/* Circular Progress */}
                <div className="relative mb-6">
                    {isRunning && (
                        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 pulse-animation bg-green-500"
                        />
                    )}

                    <svg width={size} height={size} className="transform -rotate-90 relative z-10 timer-ring-glow">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={strokeWidth}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#2ecc71"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.6))' }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <span className="text-4xl font-bold text-white font-mono-timer" id="timer-display">
                            {formatTime(timeRemaining)}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                            {settings.workDuration}m focus / {settings.breakDuration}m break
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetTimer}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 
                       hover:bg-gray-200 transition-all duration-200"
                        id="reset-btn"
                        aria-label="Reset timer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                       transition-all duration-300 hover:scale-105 active:scale-95
                       ${isRunning
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : mode === 'work'
                                    ? 'bg-green-500 hover:bg-green-600 pulse-play'
                                    : 'bg-green-500 hover:bg-green-600 pulse-play'}`}
                        id="play-pause-btn"
                        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                    >
                        {isRunning ? (
                            <Pause className="w-5 h-5 text-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                    </button>

                    <div className="w-10 h-10" />
                </div>
            </div>

            {/* Session History */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Today</span>
                    <span className="font-semibold text-gray-800">{sessions * settings.workDuration}m</span>
                </div>
                <div className="mt-2 flex gap-1">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${i < sessions ? 'bg-purple-500' : 'bg-gray-100'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
