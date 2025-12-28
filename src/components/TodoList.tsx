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
        <div className="card p-6 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Flag className="w-5 h-5 text-green-500" />
                        Priority Tasks
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {completedCount} of {todos.length} completed
                    </p>
                </div>
                <div className="badge badge-green text-xs">
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
                        className="input-field w-full pl-11"
                        id="todo-input"
                    />
                </div>
                <button
                    onClick={addTodo}
                    className="btn-primary flex items-center gap-1 flex-shrink-0"
                    id="add-todo-btn"
                >
                    Add
                </button>
            </div>

            {/* Progress Bar with Percentage */}
            <div className="mb-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-green-500">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {todos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Circle className="w-7 h-7 text-green-500/50" />
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
