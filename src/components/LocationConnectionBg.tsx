import { motion } from "motion/react";

interface ConnectionPoint {
  x: number;
  y: number;
  label: string;
}

interface PathData {
  id: string;
  p0: { x: number; y: number }; // Start coordinate
  p1: { x: number; y: number }; // Control point for smooth bend
  p2: { x: number; y: number }; // End coordinate
  dur: number;
  delay: number;
}

// Computes keyframe arrays along a quadratic bezier curve to guarantee smooth round movement
function getBezierKeyframes(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  steps = 40
) {
  const lefts: string[] = [];
  const tops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier Formula: B(t) = (1-t)² * P0 + 2(1-t)t * P1 + t² * P2
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    lefts.push(`${x}%`);
    tops.push(`${y}%`);
  }
  return { lefts, tops };
}

export default function LocationConnectionBg() {
  // Ultra-simple english flow states matching the vertical timeline sections
  const points: ConnectionPoint[] = [
    { x: 20, y: 5, label: "Task Created" },
    { x: 80, y: 22, label: "Finding Helper" },
    { x: 16, y: 41, label: "Helper Found" },
    { x: 82, y: 60, label: "Users Connected" },
    { x: 20, y: 79, label: "Task Completed" },
    { x: 74, y: 94, label: "Payment Settled" },
  ];

  // Path data matching the 6 consecutive nodes with smooth, consistent sweep arcs
  const pathsData: PathData[] = [
    {
      id: "step-1-to-2",
      p0: { x: 20, y: 5 },
      p1: { x: 55, y: 8 },
      p2: { x: 80, y: 22 },
      dur: 7,
      delay: 0,
    },
    {
      id: "step-2-to-3",
      p0: { x: 80, y: 22 },
      p1: { x: 45, y: 28 },
      p2: { x: 16, y: 41 },
      dur: 7.5,
      delay: 1.5,
    },
    {
      id: "step-3-to-4",
      p0: { x: 16, y: 41 },
      p1: { x: 52, y: 47 },
      p2: { x: 82, y: 60 },
      dur: 7.2,
      delay: 3,
    },
    {
      id: "step-4-to-5",
      p0: { x: 82, y: 60 },
      p1: { x: 48, y: 66 },
      p2: { x: 20, y: 79 },
      dur: 8,
      delay: 0.5,
    },
    {
      id: "step-5-to-6",
      p0: { x: 20, y: 79 },
      p1: { x: 50, y: 83 },
      p2: { x: 74, y: 94 },
      dur: 6.8,
      delay: 4.5,
    },
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10 select-none">
      {/* SVG Container for background route lines */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle line gradient using lower brand opacities (very non-obtrusive) */}
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F03220" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#8D2B00" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#F03220" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* 1. Underlying dashed static flight paths (smooth curves) */}
        {pathsData.map((p) => {
          const dString = `M ${p.p0.x} ${p.p0.y} Q ${p.p1.x} ${p.p1.y} ${p.p2.x} ${p.p2.y}`;
          return (
            <path
              key={`route-${p.id}`}
              d={dString}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4, 5"
              strokeOpacity="0.8"
            />
          );
        })}
      </svg>

      {/* 2. Flying active flight-style connection dots as HTML elements (NEVER distorted) */}
      {pathsData.map((p) => {
        const { lefts, tops } = getBezierKeyframes(p.p0, p.p1, p.p2, 40);
        return (
          <div key={`flying-group-${p.id}`} className="absolute inset-0 pointer-events-none">
            {/* Outer subtle brand halo glow (forces perfect circle shape natively) */}
            <motion.div
              className="absolute bg-[#F03220] opacity-20 blur-[1.5px] z-20"
              animate={{
                left: lefts,
                top: tops,
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              style={{
                transform: "translate(-50%, -50%)",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                flexShrink: 0,
                flexGrow: 0,
              }}
            />
            
            {/* Center solid white pinpoint core (forces perfect circle shape natively) */}
            <motion.div
              className="absolute bg-white border border-[#F03220]/40 shadow-[0_0_5px_rgba(240,50,32,0.5)] z-30"
              animate={{
                left: lefts,
                top: tops,
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              style={{
                transform: "translate(-50%, -50%)",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                flexShrink: 0,
                flexGrow: 0,
              }}
            />
          </div>
        );
      })}

      {/* 3. Connection Hub points styled as absolute DIVs so they are perfectly round */}
      {points.map((pt, idx) => (
        <div
          key={`hub-${idx}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
          style={{
            left: `${pt.x}%`,
            top: `${pt.y}%`,
          }}
        >
          {/* Subtle radar ping effect */}
          <div className="absolute rounded-full bg-[#F03220]/5 border border-[#F03220]/10 animate-ping duration-[5000ms] ease-in-out" style={{ width: "24px", height: "24px" }} />
          
          {/* Perfectly round center pinpoint */}
          <div 
            className="bg-neutral-800 border border-[#F03220]/30 flex items-center justify-center shadow-md shadow-black"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          >
            <div className="bg-[#F03220] rounded-full" style={{ width: "3px", height: "3px" }} />
          </div>

          {/* Node text content label - ultra subtle, small and minimalist */}
          <div className="absolute left-3.5 top-0 flex flex-col pointer-events-none opacity-40 hover:opacity-100 transition-opacity duration-300">
            <span className="text-[8px] font-mono font-medium tracking-wide text-neutral-500 bg-black/40 backdrop-blur-[2px] px-1.5 py-0.5 rounded border border-white/[0.02] whitespace-nowrap">
              {pt.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
