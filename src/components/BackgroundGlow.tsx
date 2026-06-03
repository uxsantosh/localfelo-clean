import { motion } from "motion/react";

export default function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black" id="background-glow-container">
      {/* Prime fluid flowing canvas gradient */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen mix-blend-color-dodge transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(240, 50, 32, 0.15) 0%, rgba(141, 43, 0, 0.1) 40%, rgba(0, 0, 0, 0) 100%)`
        }}
      />

      {/* Floating lighting orb 1 - Red */}
      <motion.div
        className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full filter blur-[100px] opacity-25"
        style={{
          background: "radial-gradient(circle, #F03220 0%, rgba(240, 50, 32, 0) 70%)",
          top: "-10%",
          left: "5%",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        id="bg-orb-red"
      />

      {/* Floating lighting orb 2 - Deep Orange / Copper */}
      <motion.div
        className="absolute w-[450px] h-[450px] md:w-[700px] md:h-[700px] rounded-full filter blur-[120px] opacity-30"
        style={{
          background: "radial-gradient(circle, #8D2B00 0%, rgba(141, 43, 0, 0) 70%)",
          bottom: "10%",
          right: "10%",
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        id="bg-orb-copper"
      />

      {/* Center ambient spotlight for phone highlight */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full filter blur-[140px] opacity-40 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(240, 50, 32, 0.45) 0%, rgba(141, 43, 0, 0.15) 50%, rgba(0, 0, 0, 0) 80%)",
        }}
        animate={{
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        id="bg-orb-center"
      />

      {/* Background stars / dust nodes subtle effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" 
        id="bg-dust-mesh"
      />
    </div>
  );
}
