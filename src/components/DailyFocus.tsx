'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Check } from 'lucide-react';

interface SelectedDate {
    day: number;
    month: number;
    year: number;
}

interface Event {
    id: string;
    date: string; // YYYY-MM-DD format
    title: string;
    completed: boolean;
}

const STORAGE_KEY = 'zenflow-calendar-events';

export default function DailyFocus() {
    const [currentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [showEventInput, setShowEventInput] = useState(false);

    // Load events from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setEvents(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse events:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save events to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        }
    }, [events, isLoaded]);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const days: (number | null)[] = [];

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number | null) => {
        if (!day || !selectedDate) return false;
        return day === selectedDate.day &&
            currentMonth.getMonth() === selectedDate.month &&
            currentMonth.getFullYear() === selectedDate.year;
    };

    const getDateKey = (day: number) => {
        const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        return `${currentMonth.getFullYear()}-${month}-${dayStr}`;
    };

    const hasEvents = (day: number | null) => {
        if (!day) return false;
        const dateKey = getDateKey(day);
        return events.some(e => e.date === dateKey);
    };

    const selectDate = (day: number) => {
        setSelectedDate({
            day,
            month: currentMonth.getMonth(),
            year: currentMonth.getFullYear()
        });
        setShowEventInput(false);
        setNewEventTitle('');
    };

    const addEvent = () => {
        if (!selectedDate || !newEventTitle.trim()) return;

        const dateKey = getDateKey(selectedDate.day);
        const newEvent: Event = {
            id: crypto.randomUUID(),
            date: dateKey,
            title: newEventTitle.trim(),
            completed: false
        };

        setEvents(prev => [...prev, newEvent]);
        setNewEventTitle('');
        setShowEventInput(false);
    };

    const toggleEvent = (id: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, completed: !e.completed } : e
        ));
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const days = getDaysInMonth(currentMonth);
    const selectedDateKey = selectedDate ? getDateKey(selectedDate.day) : null;
    const selectedDateEvents = events.filter(e => e.date === selectedDateKey);

    const formatSelectedDate = () => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="card p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Activity Planner
                </h2>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <span className="font-bold text-gray-200">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => day && selectDate(day)}
                            disabled={!day}
                            className={`aspect-square flex flex-col items-center justify-center text-sm transition-all duration-200 relative
                ${day === null ? '' : 'hover:bg-white/10 cursor-pointer'}
                ${isSelected(day)
                                    ? 'bg-green-500 text-white font-semibold rounded-full'
                                    : isToday(day)
                                        ? 'bg-green-500/20 text-green-400 font-semibold rounded-full'
                                        : 'text-gray-300 rounded-lg'
                                }`}
                        >
                            {day}
                            {hasEvents(day) && !isSelected(day) && (
                                <div className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Date Events */}
            <div className="flex-1 overflow-y-auto border-t border-gray-100 pt-4">
                {selectedDate ? (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">{formatSelectedDate()}</span>
                            <button
                                onClick={() => setShowEventInput(true)}
                                className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {showEventInput && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                                    placeholder="Add event..."
                                    className="input-field flex-1 py-2 text-sm"
                                    autoFocus
                                />
                                <button onClick={addEvent} className="btn-primary py-2 px-3">
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {selectedDateEvents.length > 0 ? (
                            <div className="space-y-2">
                                {selectedDateEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg group ${event.completed ? 'bg-gray-50' : 'bg-purple-50'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleEvent(event.id)}
                                            className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${event.completed
                                                ? 'bg-purple-600 border-purple-600'
                                                : 'border-gray-300 hover:border-purple-400'
                                                }`}
                                        >
                                            {event.completed && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <span className={`flex-1 text-sm ${event.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                            {event.title}
                                        </span>
                                        <button
                                            onClick={() => deleteEvent(event.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 text-xs transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">
                                No events. Click + to add one.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        Select a date to view or add events
                    </p>
                )}
            </div>
        </div>
    );
}
