import React from 'react';

interface FeloMascotProps {
  variant: 'green' | 'black' | 'white';
  gender: 'male' | 'female';
}

export function FeloMascot({ variant, gender }: FeloMascotProps) {
  const colors = {
    green: {
      suit: '#0f0f0f',
      suitMid: '#1f1f1f',
      suitLight: '#2f2f2f',
      accent: '#CDFF00',
      accentDark: '#B8E600',
      cape: '#1a1a1a',
      capeDark: '#0f0f0f',
      skin: '#FFD5B8',
      skinMid: '#F5C9AA',
      skinDark: '#E6BA9A',
      hair: '#2C1810',
      hairMid: '#4A2F1F',
      cap: '#0f0f0f',
      capAccent: '#CDFF00',
    },
    black: {
      suit: '#CDFF00',
      suitMid: '#D8FF33',
      suitLight: '#E3FF66',
      accent: '#000000',
      accentDark: '#1a1a1a',
      cape: '#B8E600',
      capeDark: '#A3CC00',
      skin: '#FFCDA8',
      skinMid: '#F5C19A',
      skinDark: '#E6B28A',
      hair: '#3E2723',
      hairMid: '#5D4037',
      cap: '#CDFF00',
      capAccent: '#000000',
    },
    white: {
      suit: '#2E7D32',
      suitMid: '#43A047',
      suitLight: '#66BB6A',
      accent: '#CDFF00',
      accentDark: '#B8E600',
      cape: '#388E3C',
      capeDark: '#2E7D32',
      skin: '#FFD5B8',
      skinMid: '#F5C9AA',
      skinDark: '#E6BA9A',
      hair: '#3E2723',
      hairMid: '#5D4037',
      cap: '#2E7D32',
      capAccent: '#CDFF00',
    },
  };

  const c = colors[variant];
  const id = `${variant}-${gender}`;

  if (gender === 'male') {
    return (
      <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`sg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.suitLight} />
            <stop offset="100%" stopColor={c.suit} />
          </linearGradient>
          <linearGradient id={`cg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.cape} />
            <stop offset="100%" stopColor={c.capeDark} />
          </linearGradient>
          <linearGradient id={`skg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.skin} />
            <stop offset="60%" stopColor={c.skinMid} />
            <stop offset="100%" stopColor={c.skinDark} />
          </linearGradient>
          <radialGradient id={`eg-${id}`}>
            <stop offset="0%" stopColor={c.accent} />
            <stop offset="100%" stopColor={c.accentDark} />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes cape-${id} {
            0%, 100% { d: path("M 42 60 Q 20 75, 18 110 Q 16 145, 30 165 L 38 168 Q 44 150, 46 132 L 50 110 L 52 85 L 54 68 Z"); }
            50% { d: path("M 42 60 Q 22 77, 20 112 Q 18 148, 32 167 L 40 170 Q 46 152, 48 134 L 52 112 L 54 87 L 54 68 Z"); }
          }
          @keyframes cape-r-${id} {
            0%, 100% { d: path("M 118 60 Q 140 75, 142 110 Q 144 145, 130 165 L 122 168 Q 116 150, 114 132 L 110 110 L 108 85 L 106 68 Z"); }
            50% { d: path("M 118 60 Q 138 77, 140 112 Q 142 148, 128 167 L 120 170 Q 114 152, 112 134 L 108 112 L 106 87 L 106 68 Z"); }
          }
          @keyframes breathe-${id} {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.004) translateY(-1px); }
          }
          @keyframes pulse-${id} {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.3; }
          }
          @keyframes ready-${id} {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-0.8deg); }
          }
          @keyframes glow-${id} {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.95; }
          }
          @keyframes blink-${id} {
            0%, 94%, 100% { transform: scaleY(1); }
            95%, 97% { transform: scaleY(0.1); }
          }
        `}</style>

        {/* Cape */}
        <path d="M 42 60 Q 20 75, 18 110 Q 16 145, 30 165 L 38 168 Q 44 150, 46 132 L 50 110 L 52 85 L 54 68 Z" fill={`url(#cg-${id})`} opacity="0.9" style={{ animation: `cape-${id} 3s ease-in-out infinite` }} />
        <path d="M 118 60 Q 140 75, 142 110 Q 144 145, 130 165 L 122 168 Q 116 150, 114 132 L 110 110 L 108 85 L 106 68 Z" fill={`url(#cg-${id})`} opacity="0.9" style={{ animation: `cape-r-${id} 3s ease-in-out infinite` }} />

        <g style={{ animation: `breathe-${id} 4s ease-in-out infinite` }}>
          {/* Legs */}
          <rect x="64" y="118" width="14" height="50" rx="2" fill={`url(#sg-${id})`} />
          <rect x="82" y="118" width="14" height="50" rx="2" fill={`url(#sg-${id})`} />
          
          {/* Boots */}
          <ellipse cx="71" cy="170" rx="8" ry="4" fill={c.suit} />
          <ellipse cx="89" cy="170" rx="8" ry="4" fill={c.suit} />
          <rect x="66" y="165" width="10" height="4" fill={c.accent} opacity="0.5" />
          <rect x="84" y="165" width="10" height="4" fill={c.accent} opacity="0.5" />

          {/* Body */}
          <path d="M 58 60 Q 56 62, 56 68 L 54 90 L 53 113 Q 53 118, 57 118 L 103 118 Q 107 118, 107 113 L 106 90 L 104 68 Q 104 62, 102 60 L 94 62 L 85 65 L 80 66 L 75 65 L 66 62 Z" fill={`url(#sg-${id})`} />
          
          {/* Chest definition */}
          <ellipse cx="73" cy="76" rx="7" ry="10" fill={c.suitLight} opacity="0.15" />
          <ellipse cx="87" cy="76" rx="7" ry="10" fill={c.suitLight} opacity="0.15" />
          <line x1="80" y1="70" x2="80" y2="85" stroke={c.suit} strokeWidth="1" opacity="0.1" />
          
          {/* Abs */}
          <ellipse cx="76" cy="96" rx="5" ry="3" fill={c.suit} opacity="0.1" />
          <ellipse cx="84" cy="96" rx="5" ry="3" fill={c.suit} opacity="0.1" />

          {/* Belt */}
          <rect x="56" y="113" width="48" height="6" rx="1" fill={c.accent} />
          <rect x="77" y="113" width="6" height="6" fill={c.accentDark} />

          {/* Emblem - Italic F */}
          <g transform="translate(80, 78)" style={{ animation: `glow-${id} 2.5s ease-in-out infinite` }}>
            <circle cx="0" cy="0" r="14" fill={`url(#eg-${id})`} />
            <circle cx="0" cy="0" r="14" stroke={c.suit} strokeWidth="1.5" fill="none" opacity="0.3" />
            <g transform="skewX(-14)">
              <path d="M -5 -9 L 5 -9 L 4 -5.5 L -1.5 -5.5 L -2.5 -1 L 2.5 -1 L 1.5 2.5 L -3.5 2.5 L -5 8 L -8.5 8 Z" fill={variant === 'black' ? '#000' : '#FFF'} />
            </g>
          </g>

          {/* Arms */}
          <g style={{ animation: `ready-${id} 3.5s ease-in-out infinite`, transformOrigin: '55px 65px' }}>
            <path d="M 58 60 L 45 68 L 38 78 Q 36 81, 38 84 L 42 86 Q 44 83, 48 78 L 54 70 L 57 64 Z" fill={`url(#skg-${id})`} />
            <ellipse cx="45" cy="74" rx="3" ry="6" fill={c.skinDark} opacity="0.2" />
            <ellipse cx="38" cy="84" rx="6" ry="7" fill={c.skinMid} />
          </g>

          <g style={{ animation: `ready-${id} 3.5s ease-in-out infinite`, animationDelay: '0.3s', transformOrigin: '105px 65px' }}>
            <path d="M 102 60 L 115 52 L 122 45 Q 125 42, 128 45 L 126 49 Q 123 52, 118 56 L 108 66 L 104 72 Z" fill={`url(#skg-${id})`} />
            <ellipse cx="118" cy="52" rx="3" ry="6" fill={c.skinDark} opacity="0.2" transform="rotate(-20 118 52)" />
            <ellipse cx="126" cy="45" rx="7" ry="8" fill={c.skinMid} />
            <circle cx="126" cy="45" r="14" fill={c.accent} opacity="0.15" style={{ animation: `pulse-${id} 3s ease-in-out infinite` }} />
          </g>

          {/* Neck */}
          <path d="M 72 56 L 70 62 L 90 62 L 88 56 Z" fill={`url(#skg-${id})`} />

          {/* Head */}
          <ellipse cx="80" cy="38" rx="16" ry="18" fill={`url(#skg-${id})`} />
          
          {/* Jaw */}
          <path d="M 68 46 Q 80 49, 92 46" stroke={c.skinDark} strokeWidth="0.8" opacity="0.15" />

          {/* Ears */}
          <ellipse cx="64" cy="39" rx="2" ry="3.5" fill={c.skinMid} />
          <ellipse cx="96" cy="39" rx="2" ry="3.5" fill={c.skinMid} />

          {/* Hair - Professional short */}
          <path d="M 64 28 Q 63 22, 68 19 L 74 17 L 80 16 L 86 17 L 92 19 Q 97 22, 96 28 L 95 33 Q 92 35, 88 34 L 86 32 L 80 33 L 74 32 L 72 34 Q 68 35, 65 33 Z" fill={c.hair} />
          <path d="M 68 28 Q 67 24, 71 21 L 80 19 L 89 21 Q 93 24, 92 28" fill={c.hair} />
          <path d="M 71 28 Q 70 25, 74 23 L 80 21 L 86 23 Q 90 25, 89 28" fill={c.hairMid} opacity="0.3" />

          {/* Cap - Simple superhero cap */}
          <path d="M 64 30 Q 64 24, 68 21 L 74 19 L 80 18 L 86 19 L 92 21 Q 96 24, 96 30 L 96 33 L 64 33 Z" fill={c.cap} opacity="0.95" />
          <ellipse cx="80" cy="22" rx="10" ry="3" fill={c.capAccent} opacity="0.4" />
          <line x1="68" y1="21" x2="92" y2="21" stroke={c.capAccent} strokeWidth="0.8" opacity="0.3" />

          {/* Eyebrows */}
          <path d="M 70 35 Q 73 34.5, 76 35" stroke={c.hair} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 84 35 Q 87 34.5, 90 35" stroke={c.hair} strokeWidth="1.8" strokeLinecap="round" />

          {/* Eyes - Small with blinking */}
          <g style={{ animation: `blink-${id} 5s ease-in-out infinite`, transformOrigin: '74px 38px' }}>
            <ellipse cx="74" cy="38" rx="3" ry="3.5" fill="#FFF" />
            <circle cx="74.5" cy="38.5" r="2" fill="#2563EB" />
            <circle cx="75" cy="37.5" r="1.3" fill="#0f172a" />
            <circle cx="75.2" cy="37.2" r="0.6" fill="#FFF" />
          </g>
          <g style={{ animation: `blink-${id} 5s ease-in-out infinite`, transformOrigin: '86px 38px' }}>
            <ellipse cx="86" cy="38" rx="3" ry="3.5" fill="#FFF" />
            <circle cx="86.5" cy="38.5" r="2" fill="#2563EB" />
            <circle cx="87" cy="37.5" r="1.3" fill="#0f172a" />
            <circle cx="87.2" cy="37.2" r="0.6" fill="#FFF" />
          </g>

          {/* Nose */}
          <path d="M 80 40 L 79 43" stroke={c.skinDark} strokeWidth="0.8" opacity="0.2" />
          <ellipse cx="78.8" cy="43.5" rx="0.8" ry="0.6" fill={c.skinDark} opacity="0.15" />
          <ellipse cx="81.2" cy="43.5" rx="0.8" ry="0.6" fill={c.skinDark} opacity="0.15" />

          {/* Small smile */}
          <path d="M 74 46 Q 80 48, 86 46" stroke={c.skinDark} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
        </g>
      </svg>
    );
  }

  // Female
  return (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`sg-f-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.suitLight} />
          <stop offset="100%" stopColor={c.suit} />
        </linearGradient>
        <linearGradient id={`cg-f-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.cape} />
          <stop offset="100%" stopColor={c.capeDark} />
        </linearGradient>
        <linearGradient id={`skg-f-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.skin} />
          <stop offset="60%" stopColor={c.skinMid} />
          <stop offset="100%" stopColor={c.skinDark} />
        </linearGradient>
        <radialGradient id={`eg-f-${id}`}>
          <stop offset="0%" stopColor={c.accent} />
          <stop offset="100%" stopColor={c.accentDark} />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes cape-f-${id} {
          0%, 100% { d: path("M 44 62 Q 22 77, 20 112 Q 18 147, 32 167 L 40 170 Q 46 152, 48 134 L 52 112 L 54 87 L 56 70 Z"); }
          50% { d: path("M 44 62 Q 24 79, 22 114 Q 20 150, 34 169 L 42 172 Q 48 154, 50 136 L 54 114 L 56 89 L 56 70 Z"); }
        }
        @keyframes cape-rf-${id} {
          0%, 100% { d: path("M 116 62 Q 138 77, 140 112 Q 142 147, 128 167 L 120 170 Q 114 152, 112 134 L 108 112 L 106 87 L 104 70 Z"); }
          50% { d: path("M 116 62 Q 136 79, 138 114 Q 140 150, 126 169 L 118 172 Q 112 154, 110 136 L 106 114 L 104 89 L 104 70 Z"); }
        }
        @keyframes breathe-f-${id} {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.003) translateY(-0.8px); }
        }
        @keyframes pulse-f-${id} {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.25; }
        }
        @keyframes ready-f-${id} {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-0.6deg); }
        }
        @keyframes glow-f-${id} {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes blink-f-${id} {
          0%, 95%, 100% { transform: scaleY(1); }
          96%, 98% { transform: scaleY(0.1); }
        }
        @keyframes hair-f-${id} {
          0%, 100% { d: path("M 62 32 Q 60 43, 62 54 L 64 52 Q 63 40, 66 32 Z"); }
          50% { d: path("M 62 32 Q 58 43, 60 54 L 62 52 Q 61 40, 64 32 Z"); }
        }
      `}</style>

      {/* Cape */}
      <path d="M 44 62 Q 22 77, 20 112 Q 18 147, 32 167 L 40 170 Q 46 152, 48 134 L 52 112 L 54 87 L 56 70 Z" fill={`url(#cg-f-${id})`} opacity="0.9" style={{ animation: `cape-f-${id} 3.3s ease-in-out infinite` }} />
      <path d="M 116 62 Q 138 77, 140 112 Q 142 147, 128 167 L 120 170 Q 114 152, 112 134 L 108 112 L 106 87 L 104 70 Z" fill={`url(#cg-f-${id})`} opacity="0.9" style={{ animation: `cape-rf-${id} 3.3s ease-in-out infinite` }} />

      <g style={{ animation: `breathe-f-${id} 4.5s ease-in-out infinite` }}>
        {/* Legs */}
        <rect x="66" y="116" width="13" height="48" rx="2" fill={`url(#sg-f-${id})`} />
        <rect x="81" y="116" width="13" height="48" rx="2" fill={`url(#sg-f-${id})`} />
        
        {/* Boots */}
        <ellipse cx="72.5" cy="166" rx="7.5" ry="3.5" fill={c.suit} />
        <ellipse cx="87.5" cy="166" rx="7.5" ry="3.5" fill={c.suit} />
        <rect x="68" y="161" width="9" height="4" fill={c.accent} opacity="0.5" />
        <rect x="83" y="161" width="9" height="4" fill={c.accent} opacity="0.5" />

        {/* Body */}
        <path d="M 60 62 Q 58 64, 58 70 L 56 90 L 55 111 Q 55 116, 59 116 L 101 116 Q 105 116, 105 111 L 104 90 L 102 70 Q 102 64, 100 62 L 92 64 L 85 67 L 80 68 L 75 67 L 68 64 Z" fill={`url(#sg-f-${id})`} />
        
        {/* Body definition */}
        <path d="M 63 88 Q 80 86, 97 88" stroke={c.suit} strokeWidth="0.8" opacity="0.1" />
        <ellipse cx="73" cy="76" rx="6" ry="9" fill={c.suitLight} opacity="0.12" />
        <ellipse cx="87" cy="76" rx="6" ry="9" fill={c.suitLight} opacity="0.12" />

        {/* Belt */}
        <rect x="58" y="111" width="44" height="5.5" rx="1" fill={c.accent} />
        <rect x="77" y="111" width="6" height="5.5" fill={c.accentDark} />

        {/* Emblem - Italic F */}
        <g transform="translate(80, 78)" style={{ animation: `glow-f-${id} 2.7s ease-in-out infinite` }}>
          <circle cx="0" cy="0" r="13" fill={`url(#eg-f-${id})`} />
          <circle cx="0" cy="0" r="13" stroke={c.suit} strokeWidth="1.3" fill="none" opacity="0.3" />
          <g transform="skewX(-15)">
            <path d="M -4.5 -8 L 4.5 -8 L 3.5 -5 L -1.3 -5 L -2.2 -0.8 L 2.2 -0.8 L 1.3 2.3 L -3 2.3 L -4.5 7.5 L -7.5 7.5 Z" fill={variant === 'black' ? '#000' : '#FFF'} />
          </g>
        </g>

        {/* Arms */}
        <g style={{ animation: `ready-f-${id} 4s ease-in-out infinite`, transformOrigin: '57px 67px' }}>
          <path d="M 60 62 L 47 70 L 40 80 Q 38 83, 40 86 L 44 88 Q 46 85, 50 80 L 56 72 L 59 66 Z" fill={`url(#skg-f-${id})`} />
          <ellipse cx="47" cy="76" rx="2.5" ry="5" fill={c.skinDark} opacity="0.18" />
          <ellipse cx="40" cy="86" rx="5.5" ry="6.5" fill={c.skinMid} />
        </g>

        <g style={{ animation: `ready-f-${id} 4s ease-in-out infinite`, animationDelay: '0.4s', transformOrigin: '103px 67px' }}>
          <path d="M 100 62 L 113 54 L 120 47 Q 123 44, 126 47 L 124 51 Q 121 54, 116 58 L 106 68 L 102 74 Z" fill={`url(#skg-f-${id})`} />
          <ellipse cx="116" cy="54" rx="2.5" ry="5" fill={c.skinDark} opacity="0.18" transform="rotate(-18 116 54)" />
          <ellipse cx="124" cy="47" rx="6.5" ry="7.5" fill={c.skinMid} />
          <circle cx="124" cy="47" r="13" fill={c.accent} opacity="0.12" style={{ animation: `pulse-f-${id} 3.2s ease-in-out infinite` }} />
        </g>

        {/* Neck */}
        <path d="M 73 58 L 71 64 L 89 64 L 87 58 Z" fill={`url(#skg-f-${id})`} />

        {/* Head */}
        <ellipse cx="80" cy="36" rx="15" ry="17" fill={`url(#skg-f-${id})`} />
        
        {/* Face */}
        <path d="M 69 44 Q 80 47, 91 44" stroke={c.skinDark} strokeWidth="0.7" opacity="0.13" />

        {/* Ears */}
        <ellipse cx="65" cy="37" rx="1.8" ry="3.2" fill={c.skinMid} />
        <ellipse cx="95" cy="37" rx="1.8" ry="3.2" fill={c.skinMid} />

        {/* Hair - Professional sleek */}
        <ellipse cx="80" cy="26" rx="18" ry="15" fill={c.hair} />
        <path d="M 62 32 Q 60 43, 62 54 L 64 52 Q 63 40, 66 32 Z" fill={c.hair} style={{ animation: `hair-f-${id} 3s ease-in-out infinite` }} />
        <path d="M 98 32 Q 100 43, 98 54 L 96 52 Q 97 40, 94 32 Z" fill={c.hair} style={{ animation: `hair-f-${id} 3s ease-in-out infinite`, animationDelay: '0.3s' }} />
        <ellipse cx="80" cy="23" rx="12" ry="6" fill={c.hairMid} opacity="0.25" />

        {/* Cap - Simple superhero cap */}
        <path d="M 65 32 Q 65 26, 69 23 L 75 21 L 80 20 L 85 21 L 91 23 Q 95 26, 95 32 L 95 35 L 65 35 Z" fill={c.cap} opacity="0.93" />
        <ellipse cx="80" cy="23" rx="9" ry="2.5" fill={c.capAccent} opacity="0.35" />
        <line x1="69" y1="23" x2="91" y2="23" stroke={c.capAccent} strokeWidth="0.7" opacity="0.3" />

        {/* Eyebrows */}
        <path d="M 71 33 Q 74 32.5, 77 33" stroke={c.hair} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 83 33 Q 86 32.5, 89 33" stroke={c.hair} strokeWidth="1.6" strokeLinecap="round" />

        {/* Eyes - Small with blinking */}
        <g style={{ animation: `blink-f-${id} 5.5s ease-in-out infinite`, transformOrigin: '75px 36px' }}>
          <ellipse cx="75" cy="36" rx="3" ry="3.5" fill="#FFF" />
          <circle cx="75.5" cy="36.5" r="2" fill="#8B5A3D" />
          <circle cx="76" cy="35.5" r="1.3" fill="#0f172a" />
          <circle cx="76.2" cy="35.2" r="0.6" fill="#FFF" />
        </g>
        <g style={{ animation: `blink-f-${id} 5.5s ease-in-out infinite`, transformOrigin: '85px 36px' }}>
          <ellipse cx="85" cy="36" rx="3" ry="3.5" fill="#FFF" />
          <circle cx="85.5" cy="36.5" r="2" fill="#8B5A3D" />
          <circle cx="86" cy="35.5" r="1.3" fill="#0f172a" />
          <circle cx="86.2" cy="35.2" r="0.6" fill="#FFF" />
        </g>

        {/* Eyelashes */}
        <path d="M 72 35 L 71.2 33.8" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 74 34.5 L 73.5 33" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 76 34.5 L 76 33" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 84 34.5 L 84 33" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 86 34.5 L 86.5 33" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 88 35 L 88.8 33.8" stroke={c.hair} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />

        {/* Nose */}
        <path d="M 80 38 L 79 41" stroke={c.skinDark} strokeWidth="0.7" opacity="0.18" />
        <ellipse cx="78.8" cy="41.5" rx="0.7" ry="0.5" fill={c.skinDark} opacity="0.13" />
        <ellipse cx="81.2" cy="41.5" rx="0.7" ry="0.5" fill={c.skinDark} opacity="0.13" />

        {/* Small smile */}
        <path d="M 75 44 Q 80 46, 85 44" stroke={c.skinDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
      </g>
    </svg>
  );
}
