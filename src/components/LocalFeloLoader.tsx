import React from 'react';
import { motion } from 'motion/react';

interface LocalFeloLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: { width: 60, height: 60, textSize: 'text-sm' },
  md: { width: 100, height: 100, textSize: 'text-base' },
  lg: { width: 150, height: 150, textSize: 'text-lg' },
  xl: { width: 200, height: 200, textSize: 'text-xl' },
};

export function LocalFeloLoader({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false 
}: LocalFeloLoaderProps) {
  const dimensions = sizeMap[size];

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Logo */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 489 480" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main body - slight scale pulse */}
          <motion.path
            d="M270.14 257.036L445.027 415.815L387.352 479.345L211.284 319.495L62.4473 477.444L0 418.601L192.936 213.852H31.2236V128.046H391.689L270.14 257.036Z"
            fill="black"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "center" }}
          />
          
          {/* Exclamation mark - independent animation */}
          <motion.path
            d="M489 219.099L429.921 281.327L344.688 200.406L403.766 138.178L489 219.099Z"
            fill="black"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
            style={{ transformOrigin: "center" }}
          />
          
          {/* Dot - bouncing animation */}
          <motion.path
            d="M431.264 0C462.643 0.000111328 488.081 25.4382 488.081 56.8174C488.081 88.1965 462.643 113.635 431.264 113.635C399.884 113.635 374.446 88.1966 374.446 56.8174C374.446 25.4381 399.884 0 431.264 0Z"
            fill="black"
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>
      </motion.div>

      {/* Loading text with dots animation */}
      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-gray-700 font-semibold ${dimensions.textSize} flex items-center gap-1`}
        >
          <span>{text}</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            .
          </motion.span>
        </motion.div>
      )}

      {/* Subtle circular ring animation */}
      <div className="absolute" style={{ width: dimensions.width * 1.5, height: dimensions.height * 1.5 }}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#CDFF00]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#CDFF00]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5
          }}
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}
