'use client';

import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const facts = [
  {
    text: 'The average person spends about 3 years of their life on the toilet. Make sure you always find a clean one with Where To Wee!',
    emoji: '🚽',
  },
  {
    text: 'The first public toilet in the UK opened in 1852 at the Crystal Palace. Over 170 years later, finding one is still a challenge!',
    emoji: '🏛️',
  },
  {
    text: 'Around 1 in 5 people avoid going out because they worry about finding a toilet. Where To Wee is here to change that!',
    emoji: '🏃',
  },
  {
    text: 'The UK has lost over 50% of its public toilets since 2000. Community-driven apps like ours help fill the gap!',
    emoji: '📉',
  },
];

const stats = [
  { value: '92%', label: 'User satisfaction' },
  { value: '2 min', label: 'Avg. time to find' },
];

export default function DidYouKnow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % facts.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentFact = facts[currentIndex];

  return (
    <div className="bg-gradient-to-br from-mint-400 to-mint-600 rounded-3xl p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Did You Know?</h3>
        </div>

        {/* Animated Fact */}
        <div className="min-h-[100px] flex items-start gap-3 mb-6">
          <span
            className={`text-3xl transition-all duration-300 ${
              isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            }`}
          >
            {currentFact.emoji}
          </span>
          <p
            className={`text-white/90 transition-all duration-300 ${
              isAnimating
                ? 'opacity-0 translate-y-4'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {currentFact.text}
          </p>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {facts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Show fact ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
