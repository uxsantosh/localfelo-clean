import React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import Firecracker from "./Firecracker";

export default function PhoneMockup() {
  // Mouse tilt parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end feel
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [12, -12]), { damping: 25, stiffness: 120 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-14, 14]), { damping: 25, stiffness: 120 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      className="relative flex justify-center items-center py-1 select-none cursor-grab active:cursor-grabbing group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="phone-mockup-wrapper"
    >
      {/* Premium Amber/Neutral Ambient Radial Glow behind the phone asset */}
      <div 
        className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-[#9a3412]/20 to-neutral-800/20 rounded-full filter blur-[120px] pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:opacity-60" 
        id="phone-glow"
      />

      {/* Dynamic looping background firecracker animation */}
      <Firecracker />

      <motion.div
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -12, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-full max-w-[360px] md:max-w-[380px] drop-shadow-[0_35px_50px_rgba(0,0,0,0.95)] z-10"
        id="iphone-chassis-container"
      >
        {/* Subtle highlight ring behind the image to elevate depth on hover */}
        <div className="absolute inset-4 rounded-[64px] bg-white/[0.01] border border-white/[0.04] opacity-50 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 pointer-events-none" />

        {/* The high-precision product image */}
        <img
          src="/hero_phone_mockup.png"
          alt="LocalFelo Premium Mobile Interface"
          className="w-full h-auto object-contain pointer-events-none select-none relative z-10 transition-transform duration-500 group-hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />

        {/* Shadow enhancement layers */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-[#0D0D0D]/60 rounded-full blur-2xl filter opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none" />
      </motion.div>
    </div>
  );
}
