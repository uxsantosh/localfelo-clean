import React from 'react';

interface PromoTickerProps {
  messages: string[];
  speed?: 'slow' | 'medium' | 'fast';
}

export function PromoTicker({ messages, speed = 'medium' }: PromoTickerProps) {
  const speedMap = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  };

  const animationDuration = speedMap[speed];

  // Duplicate messages for seamless loop
  const duplicatedMessages = [...messages, ...messages];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary/8 via-accent/8 to-primary/8 border-y border-primary/10">
      <div className="py-2">
        <div 
          className="flex gap-8 animate-scroll"
          style={{
            animation: `scroll ${animationDuration} linear infinite`,
            width: 'max-content',
          }}
        >
          {duplicatedMessages.map((message, index) => (
            <div
              key={index}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-primary text-sm">✨</span>
              <span className="text-xs sm:text-sm text-body font-medium">
                {message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient fade on edges */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}} />
    </div>
  );
}