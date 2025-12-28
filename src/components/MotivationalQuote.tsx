'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const quotes = [
    {
        text: "Success is a way of life, not a goal.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80"
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&q=80"
    },
    {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss",
        image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80"
    },
    {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
    },
    {
        text: "Dream bigger. Do bigger.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
    },
    {
        text: "Stay focused and never give up.",
        author: "Unknown",
        image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80"
    }
];

export default function MotivationalQuote() {
    const [currentQuote, setCurrentQuote] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setCurrentQuote(Math.floor(Math.random() * quotes.length));
    }, []);

    const nextQuote = () => {
        setIsLoading(true);
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
    };

    const quote = quotes[currentQuote];

    return (
        <div className="card card-hover-lift overflow-hidden relative h-48 group">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={quote.image}
                    alt="Motivation"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onLoad={() => setIsLoading(false)}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-5">
                <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1 animate-pulse" />
                    <p className="text-white font-semibold text-lg leading-tight drop-shadow-lg">
                        "{quote.text}"
                    </p>
                </div>
                <p className="text-gray-300 text-sm ml-6">— {quote.author}</p>
            </div>

            {/* Refresh Button */}
            <button
                onClick={nextQuote}
                className="absolute top-3 right-3 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full 
                         transition-all duration-300 hover:bg-black/60 hover:rotate-180 cursor-pointer"
                aria-label="Next quote"
            >
                <RefreshCw className="w-4 h-4 text-white" />
            </button>

            {/* Daily Inspiration Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded-full 
                          border border-green-500/30 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Daily Inspiration</span>
            </div>
        </div>
    );
}
