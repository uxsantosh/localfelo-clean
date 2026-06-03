import React, { useState } from "react";
import { motion } from "motion/react";
import { Fan, Sparkles, Camera, Heart, Wrench, Shield, Check } from "lucide-react";

// Reusable Felo human logo symbol component as provided by user
const FeloSymbol = ({ className = "w-10 h-10", color = "#F03220" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_82_15)">
      <path 
        d="M158.027 151.199L231.251 221.81L205.568 248.443L132.651 178.129L66.9277 247.877L40 222.503L123.195 134.214H53.4639V97.214H208.899L158.027 151.199ZM250.86 136.477L225.385 163.311L188.632 128.417L214.106 101.583L250.86 136.477ZM225.964 42C239.495 42 250.464 52.969 250.464 66.5C250.464 80.031 239.495 91 225.964 91C212.433 91 201.464 80.031 201.464 66.5C201.464 52.969 212.433 42 225.964 42Z" 
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0_82_15">
        <rect width="290" height="290" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const TASK_PAIRS = [
  {
    request: "I need help with my fan repair today",
    offer: "Hey, I can help with fan repair",
    icon: Fan
  },
  {
    request: "I need help with my terrace cleaning today",
    offer: "Hey, I can help with terrace cleaning",
    icon: Sparkles
  },
  {
    request: "I am looking for an event photographer",
    offer: "Hey, I can help with event photography",
    icon: Camera
  },
  {
    request: "Need someone to take care of my dog for 2 days",
    offer: "Hey, I can help with dog & pet care",
    icon: Heart
  },
  {
    request: "Need help assembling my study table",
    offer: "Hey, I can help with table assembly",
    icon: Wrench
  }
];

export default function FloatingBanners() {
  const [pairIndex, setPairIndex] = useState(0);

  const handleAnimationComplete = () => {
    // Cycle randomly to a new pair after they cross the screen
    setPairIndex((prevIndex) => {
      let nextIndex = Math.floor(Math.random() * TASK_PAIRS.length);
      if (nextIndex === prevIndex) {
        nextIndex = (prevIndex + 1) % TASK_PAIRS.length;
      }
      return nextIndex;
    });
  };

  const ActiveIcon = TASK_PAIRS[pairIndex].icon;

  return (
    <div className="absolute inset-0 w-full overflow-hidden pointer-events-none z-0 select-none">
      
      {/* 1. Left-to-Right Requester Character */}
      <motion.div
        key={`req-${pairIndex}`}
        initial={{ x: "-320px", y: "0px" }}
        animate={{ 
          x: "105vw",
          y: ["0px", "-12px", "4px", "-8px", "0px"]
        }}
        transition={{ 
          x: { duration: 17, ease: "linear" },
          y: { duration: 17, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }
        }}
        onAnimationComplete={handleAnimationComplete}
        className="absolute top-[34%] left-0 flex flex-col items-center gap-2.5"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Waving Banner */}
        <motion.div
          animate={{
            rotateX: [-6, 6, -6],
            rotateY: [-8, 8, -8],
            skewY: [-3, 3, -3],
            y: [-2, 2, -2]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 backdrop-blur-md border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex items-center gap-2.5 px-4 py-2.5 rounded-none whitespace-nowrap overflow-hidden transform-gpu"
          style={{ transformStyle: "preserve-3d", perspective: 800, backfaceVisibility: "hidden", transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glossy Reflection Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="text-[#F03220] drop-shadow-[0_0_8px_rgba(240,50,32,0.4)]"
          >
            <ActiveIcon className="w-3.5 h-3.5" />
          </motion.div>
          <span className="text-[11px] font-extrabold text-white tracking-wide uppercase font-mono subpixel-antialiased" style={{ backfaceVisibility: "hidden" }}>
            {TASK_PAIRS[pairIndex].request}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-neutral-900" />
        </motion.div>

        {/* Felo Character Symbol (Requester Dark Translucent Theme) */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#F03220]/10 blur-md rounded-full" />
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/20 flex items-center justify-center p-2.5 shadow-xl">
            <FeloSymbol color="white" className="w-6.5 h-6.5" />
          </div>
        </div>
      </motion.div>

      {/* 2. Right-to-Left Helper Character */}
      <motion.div
        key={`offer-${pairIndex}`}
        initial={{ x: "105vw", y: "0px" }}
        animate={{ 
          x: "-320px",
          y: ["8px", "-8px", "12px", "-4px", "8px"]
        }}
        transition={{ 
          x: { duration: 17, ease: "linear" },
          y: { duration: 17, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }
        }}
        className="absolute top-[52%] left-0 flex flex-col items-center gap-2.5"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Waving Active Solver/Helper Banner in Brand Red */}
        <motion.div
          animate={{
            rotateX: [6, -6, 6],
            rotateY: [8, -8, 8],
            skewY: [3, -3, 3],
            y: [2, -2, 2]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative bg-gradient-to-br from-[#FF4C3B] via-[#F03220] to-[#C92A1A] border border-white/25 shadow-[0_16px_40px_rgba(240,50,32,0.25)] flex items-center gap-2.5 px-4 py-2.5 rounded-none whitespace-nowrap overflow-hidden transform-gpu"
          style={{ transformStyle: "preserve-3d", perspective: 800, backfaceVisibility: "hidden", transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glossy Reflection Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.12] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
          
          <ActiveIcon className="w-3.5 h-3.5 text-white animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
          <span className="text-[11px] font-extrabold text-white tracking-wide uppercase font-mono subpixel-antialiased" style={{ backfaceVisibility: "hidden" }}>
            {TASK_PAIRS[pairIndex].offer}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#C92A1A]" />
        </motion.div>

        {/* Felo Character Symbol (Brand Red Theme) */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#F03220]/20 blur-md rounded-full" />
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-b from-[#FF4C3B] to-[#F03220] border border-white/25 flex items-center justify-center p-2.5 shadow-xl">
            <FeloSymbol color="white" className="w-6.5 h-6.5" />
          </div>
        </div>
      </motion.div>

    </div>
  );
}
