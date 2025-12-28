'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Circle, Flag, Star } from 'lucide-react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    createdAt: number;
}

const STORAGE_KEY = 'zenflow-todos';

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setTodos(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse todos:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    const addTodo = () => {
        if (!newTodo.trim()) return;

        const todo: Todo = {
            id: crypto.randomUUID(),
            text: newTodo.trim(),
            completed: false,
            priority: 'high',
            createdAt: Date.now(),
        };

        setTodos(prev => [todo, ...prev]);
        setNewTodo('');
    };

    const toggleTodo = (id: string) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };

    const completedCount = todos.filter(t => t.completed).length;
    const pendingTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

    return (
        <div className="card card-hover-lift p-6 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Flag className="w-5 h-5 text-green-500 icon-hover" />
                        Priority Tasks
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {completedCount} of {todos.length} completed
                    </p>
                </div>
                <div className="badge badge-green text-xs animate-glow-pulse">
                    <Star className="w-3 h-3" />
                    High
                </div>
            </div>

            {/* Add Todo Input with Icon */}
            <div className="flex gap-3 mb-5 flex-shrink-0">
                <div className="flex-1 relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a new task..."
                        className="input-field w-full pl-12 focus-ring"
                        id="todo-input"
                    />
                </div>
                <button
                    onClick={addTodo}
                    className="btn-primary btn-press ripple flex items-center gap-1 flex-shrink-0"
                    id="add-todo-btn"
                >
                    Add
                </button>
            </div>

            {/* Progress Bar with Percentage */}
            <div className="mb-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-green-500 animate-count">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700 ease-out progress-glow"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 smooth-scroll stagger-children">
                {todos.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                            {/* Decorative illustration for empty state */}
                            <svg viewBox="0 0 120 120" className="w-full h-full">
                                <defs>
                                    <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.2"/>
                                        <stop offset="100%" stopColor="#27ae60" stopOpacity="0.1"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="60" cy="60" r="50" fill="url(#emptyGrad)" className="animate-float"/>
                                <rect x="35" y="30" width="50" height="60" rx="8" fill="none" stroke="#2ecc71" strokeWidth="2" strokeOpacity="0.5"/>
                                <line x1="45" y1="45" x2="75" y2="45" stroke="#2ecc71" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round"/>
                                <line x1="45" y1="55" x2="70" y2="55" stroke="#2ecc71" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round"/>
                                <line x1="45" y1="65" x2="65" y2="65" stroke="#2ecc71" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round"/>
                                <circle cx="85" cy="75" r="15" fill="#2ecc71" fillOpacity="0.2"/>
                                <path d="M80 75 L83 78 L90 71" stroke="#2ecc71" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No tasks yet</p>
                        <p className="text-gray-500 text-xs mt-1">Add your first task above</p>
                    </div>
                ) : (
                    <>
                        {pendingTodos.length > 0 && (
                            <div className="space-y-2">
                                {pendingTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="flex items-center gap-3 p-4 bg-white/5 rounded-xl 
                                                   hover:bg-white/10 transition-all duration-200 group border border-white/5 hover:border-white/10"
                                        data-todo-id={todo.id}
                                    >
                                        <button
                                            onClick={() => toggleTodo(todo.id)}
                                            className="checkbox-custom flex-shrink-0"
                                            aria-label="Mark complete"
                                        >
                                            {todo.completed && <Check className="w-3 h-3 text-white" />}
                                        </button>

                                        <span className="flex-1 text-gray-200 text-sm font-medium truncate">
                                            {todo.text}
                                        </span>

                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400
                                                       transition-all duration-200 p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0"
                                            aria-label="Delete task"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {completedTodos.length > 0 && (
                            <div className="mt-6">
                                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Completed</p>
                                <div className="space-y-2">
                                    {completedTodos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl group"
                                            data-todo-id={todo.id}
                                        >
                                            <button
                                                onClick={() => toggleTodo(todo.id)}
                                                className="checkbox-custom checked flex-shrink-0"
                                                aria-label="Mark incomplete"
                                            >
                                                <Check className="w-3 h-3 text-gray-900" />
                                            </button>

                                            <span className="flex-1 text-gray-300 text-sm line-through truncate opacity-60">
                                                {todo.text}
                                            </span>

                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400
                                                           transition-all duration-200 p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0"
                                                aria-label="Delete task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
