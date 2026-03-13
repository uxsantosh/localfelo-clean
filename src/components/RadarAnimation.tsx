import { motion } from 'motion/react';

export function RadarAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Radar circles */}
      <div className="relative w-48 h-48">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#CDFF00] rounded-full z-10" />
        
        {/* Animated radar circles */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#CDFF00] rounded-full"
            initial={{ width: 16, height: 16, opacity: 0.8 }}
            animate={{
              width: [16, 192],
              height: [16, 192],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: index * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
        
        {/* Rotating scanner line */}
        <motion.div
          className="absolute top-1/2 left-1/2 origin-left h-0.5 w-24 bg-gradient-to-r from-[#CDFF00] to-transparent"
          style={{ transformOrigin: 'left center' }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      
      {/* Text */}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-black">Looking for nearby tasks...</h3>
        <p className="mt-2 text-sm text-[#666666]">
          We'll notify you instantly when someone posts a task nearby.
        </p>
      </div>
    </div>
  );
}
