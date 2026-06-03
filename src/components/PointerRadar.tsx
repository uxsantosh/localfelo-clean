import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";

export default function PointerRadar() {
  const [isSupported, setIsSupported] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Springs for smooth, physics-based lag-behind inertia (snappy and fast tracking)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 20, stiffness: 900, mass: 0.15 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only mount pointer effect if device supports fine cursor pointers (e.g. desktops, laptops)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const supported = mediaQuery.matches;
    setIsSupported(supported);

    const checkSupport = (e: MediaQueryListEvent) => {
      setIsSupported(e.matches);
    };

    mediaQuery.addEventListener("change", checkSupport);

    // Mouse position tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    // Tracks when cursor leaves or enters viewport boundaries
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Mouse click reaction behaviors
    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Hover listeners to amplify radar pulses on interactive nodes
    const handleInteractionHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".group"); // premium container triggers

      setIsHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleInteractionHover);

    return () => {
      mediaQuery.removeEventListener("change", checkSupport);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleInteractionHover);
    };
  }, [mouseX, mouseY, isVisible]);

  // If mobile / touch-only or offscreen, do not render elements in DOM
  if (!isSupported || !isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] select-none uppercase font-mono"
      style={{ mixBlendMode: "screen" }}
    >
      {/* Physics-locked radar frame */}
      <motion.div
        className="absolute top-0 left-0 w-24 h-24 -ml-12 -mt-12 flex items-center justify-center pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        {/* Outer sonar expanding ping rings */}
        <AnimatePresence>
          {!isClicked && (
            <>
              {/* Outer wave 1 */}
              <motion.div
                key="sonar-wave-1"
                initial={{ scale: 0.2, opacity: 0.8 }}
                animate={{ 
                  scale: isHovered ? 2.2 : 1.5, 
                  opacity: 0 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isHovered ? 1.5 : 2.2, 
                  ease: "easeOut" 
                }}
                className="absolute w-12 h-12 rounded-full border border-[#F03220]/25 bg-[#F03220]/[0.01]"
              />
              {/* Outer wave 2 */}
              <motion.div
                key="sonar-wave-2"
                initial={{ scale: 0.1, opacity: 0.5 }}
                animate={{ 
                  scale: isHovered ? 1.6 : 1.0, 
                  opacity: 0 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isHovered ? 1.5 : 2.2, 
                  delay: 0.6,
                  ease: "easeOut" 
                }}
                className="absolute w-12 h-12 rounded-full border border-[#F03220]/15"
              />
            </>
          )}
        </AnimatePresence>

        {/* Dynamic click impulse flash */}
        {isClicked && (
          <motion.div
            initial={{ scale: 0.1, opacity: 1, borderWidth: "3px" }}
            animate={{ scale: 2.8, opacity: 0, borderWidth: "1px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute w-12 h-12 rounded-full border-2 border-red-500 bg-red-500/10"
          />
        )}

        {/* Center Scanner Frame Reticle */}
        <motion.div
          animate={{ 
            rotate: isHovered ? 360 : 180,
            scale: isClicked ? 0.75 : isHovered ? 1.25 : 1.0 
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: isHovered ? 2.5 : 6, ease: "linear" },
            scale: { duration: 0.2, ease: "easeOut" }
          }}
          className="relative w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center"
        >
          {/* Subtle radar rotating segment crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 -ml-[0.5px] w-[1px] bg-gradient-to-b from-[#F03220]/60 via-transparent to-[#F03220]/60" />
          <div className="absolute left-0 right-0 top-1/2 -mt-[0.5px] h-[1px] bg-gradient-to-r from-[#F03220]/60 via-transparent to-[#F03220]/60" />
          
          {/* Internal gradient sweeper overlay */}
          <div className="absolute inset-0.5 rounded-full bg-[conic-gradient(from_0deg,rgba(240,50,32,0.15)_0%,transparent_35%,transparent_100%)] animate-spin [animation-duration:3s]" />
        </motion.div>

        {/* Center Spot Focus Target Pin */}
        <motion.div 
          animate={{
            scale: isClicked ? 0.4 : isHovered ? 1.6 : 1.0,
            backgroundColor: isHovered ? "rgba(255, 255, 255, 1)" : "rgba(240, 50, 32, 1)"
          }}
          transition={{ duration: 0.2 }}
          className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_rgba(240,50,32,0.8)] z-10"
        />

        {/* Fine coordinate detail indicator hover overlay removed */}
      </motion.div>
    </div>
  );
}
