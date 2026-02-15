import React from 'react';

interface FeloBotProps {
  variant: 'green' | 'black' | 'lightgreen';
}

export function FeloBot({ variant }: FeloBotProps) {
  const colors = {
    green: {
      body: '#000000',
      accent: '#CDFF00',
      eye: '#CDFF00',
      text: '#CDFF00',
    },
    black: {
      body: '#CDFF00',
      accent: '#000000',
      eye: '#000000',
      text: '#000000',
    },
    lightgreen: {
      body: '#000000',
      accent: '#CDFF00',
      eye: '#CDFF00',
      text: '#CDFF00',
    },
  };

  const c = colors[variant];

  return (
    <div style={{ 
      animation: 'floatBot 3s ease-in-out infinite',
      transformOrigin: 'center',
    }}>
      <style>{`
        @keyframes floatBot {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        
        @keyframes smile {
          0%, 100% { d: path("M 54 62 Q 65 66, 76 62"); }
          50% { d: path("M 54 62 Q 65 68, 76 62"); }
        }
      `}</style>
      
      <svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Propeller */}
        <g transform="translate(65, 15)">
          <ellipse cx="0" cy="0" rx="22" ry="2.5" fill={c.accent} opacity="1" />
          <ellipse cx="0" cy="0" rx="2.5" ry="22" fill={c.accent} opacity="1" />
          <circle cx="0" cy="0" r="4" fill={c.body} />
        </g>

        {/* Propeller stick */}
        <line x1="65" y1="15" x2="65" y2="30" stroke={c.body} strokeWidth="2.5" />

        {/* Main body - increased height for more space */}
        <rect x="38" y="30" width="54" height="60" rx="10" fill={c.body} />
        
        {/* Body accent line */}
        <rect x="41" y="34" width="48" height="2" rx="1" fill={c.accent} opacity="0.6" />
        
        {/* Screen/Face */}
        <rect x="44" y="42" width="42" height="24" rx="5" fill={c.accent} opacity="0.15" />
        
        {/* Eyes with blink animation */}
        <g style={{ transformOrigin: '54px 54px', animation: 'blink 4s ease-in-out infinite' }}>
          <circle cx="54" cy="54" r="4.5" fill={c.eye} />
        </g>
        <g style={{ transformOrigin: '76px 54px', animation: 'blink 4s ease-in-out infinite' }}>
          <circle cx="76" cy="54" r="4.5" fill={c.eye} />
        </g>
        
        {/* Eye highlights */}
        <g style={{ transformOrigin: '55.5px 52.5px', animation: 'blink 4s ease-in-out infinite' }}>
          <circle cx="55.5" cy="52.5" r="1.5" fill={variant === 'black' ? '#CDFF00' : '#FFF'} opacity="0.7" />
        </g>
        <g style={{ transformOrigin: '77.5px 52.5px', animation: 'blink 4s ease-in-out infinite' }}>
          <circle cx="77.5" cy="52.5" r="1.5" fill={variant === 'black' ? '#CDFF00' : '#FFF'} opacity="0.7" />
        </g>
        
        {/* Smile with animation */}
        <path d="M 54 62 Q 65 66, 76 62" stroke={c.eye} strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M 54 62 Q 65 66, 76 62; M 54 62 Q 65 68, 76 62; M 54 62 Q 65 66, 76 62"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Side panels */}
        <rect x="34" y="50" width="4" height="20" rx="2" fill={c.accent} opacity="0.5" />
        <rect x="92" y="50" width="4" height="20" rx="2" fill={c.accent} opacity="0.5" />

        {/* Arms */}
        <rect x="26" y="52" width="12" height="4" rx="2" fill={c.body} />
        <circle cx="26" cy="54" r="4" fill={c.accent} opacity="0.6" />
        
        <rect x="92" y="52" width="12" height="4" rx="2" fill={c.body} />
        <circle cx="104" cy="54" r="4" fill={c.accent} opacity="0.6" />

        {/* "Felo" text on chest - positioned with more space from mouth */}
        <text 
          x="65" 
          y="78" 
          fontFamily="Arial, sans-serif" 
          fontSize="12" 
          fontWeight="800"
          fontStyle="italic"
          fill={c.text}
          textAnchor="middle"
          opacity="0.9"
        >
          Felo
        </text>

        {/* Bottom section - positioned lower */}
        <rect x="44" y="90" width="42" height="7" rx="2" fill={c.body} />
        <circle cx="52" cy="93.5" r="2" fill={c.accent} opacity="0.4" />
        <circle cx="65" cy="93.5" r="2" fill={c.accent} opacity="0.4" />
        <circle cx="78" cy="93.5" r="2" fill={c.accent} opacity="0.4" />
      </svg>
    </div>
  );
}