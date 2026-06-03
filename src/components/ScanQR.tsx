import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function ScanQR() {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="w-full max-w-sm mx-auto mt-6 relative z-20"
      id="hero-scan-qr-root"
    >
      <div 
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900/60 to-neutral-950/80 backdrop-blur-md border border-white/5 p-4 flex items-center gap-5 transition-all duration-300 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(240,50,32,0.04)]"
        id="qr-container-card"
      >
        {/* Soft backlighting beam */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#F03220]/5 rounded-full blur-2xl group-hover:bg-[#F03220]/10 transition-colors duration-500 pointer-events-none" />
        
        {/* Highlight top-edge inner border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Updatable local image with custom vector QR Code fallback container */}
        <div 
          className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-neutral-950 border border-white/10 p-2 flex items-center justify-center overflow-hidden shadow-inner"
          id="qr-image-holder"
        >
          {!imageError ? (
            <img 
              src="/qr_code.png" 
              alt="Scan QR to Download" 
              className="w-full h-full object-contain relative z-10 rounded-lg select-none pointer-events-none"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            /* Custom vector QR grid fallback if image file is not found yet */
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/90 relative z-10"
              id="qr-vector"
            >
              {/* Top Left Detection Anchor */}
              <path d="M4 4h20v20H4V4zm4 4v12h12V8H8z" fill="currentColor" />
              <rect x="11" y="11" width="6" height="6" fill="#F03220" rx="1" />

              {/* Top Right Detection Anchor */}
              <path d="M76 4h20v20H76V4zm4 4v12h12V8H80z" fill="currentColor" />
              <rect x="83" y="11" width="6" height="6" fill="#F03220" rx="1" />

              {/* Bottom Left Detection Anchor */}
              <path d="M4 76h20v20H4V76zm4 4v12h12V80H8z" fill="currentColor" />
              <rect x="11" y="83" width="6" height="6" fill="#F03220" rx="1" />

              {/* Procedural QR dots and patterns */}
              <rect x="32" y="4" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="40" y="4" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="52" y="4" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="60" y="4" width="12" height="4" fill="currentColor" rx="1" />

              <rect x="32" y="12" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="48" y="12" width="4" height="4" fill="#F03220" rx="1" />
              <rect x="56" y="12" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="68" y="12" width="4" height="12" fill="currentColor" rx="1" />

              <rect x="32" y="20" width="4" height="8" fill="currentColor" rx="1" />
              <rect x="44" y="20" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="56" y="20" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="64" y="20" width="4" height="4" fill="currentColor" rx="1" />

              <rect x="4" y="32" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="20" y="32" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="28" y="32" width="4" height="8" fill="currentColor" rx="1" />
              <rect x="36" y="32" width="8" height="4" fill="#F03220" rx="1" />
              <rect x="52" y="32" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="68" y="32" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="76" y="32" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="92" y="32" width="4" height="8" fill="currentColor" rx="1" />

              <rect x="4" y="40" width="4" height="8" fill="currentColor" rx="1" />
              <rect x="12" y="40" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="24" y="40" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="36" y="40" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="48" y="40" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="60" y="40" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="76" y="40" width="4" height="8" fill="currentColor" rx="1" />
              <rect x="84" y="40" width="8" height="4" fill="currentColor" rx="1" />

              <rect x="12" y="48" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="20" y="48" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="32" y="48" width="4" height="12" fill="currentColor" rx="1" />
              <rect x="40" y="48" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="52" y="48" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="64" y="48" width="16" height="4" fill="currentColor" rx="1" />
              <rect x="88" y="48" width="4" height="4" fill="currentColor" rx="1" />

              {/* Core logo mask / cutout background */}
              <circle cx="50" cy="50" r="12" fill="#050505" />
              
              {/* Tiny stylized center heart/Felo-like marker dots */}
              <path d="M47 48.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-3z" fill="#F03220" />
              <circle cx="50" cy="50" r="2.5" fill="white" />

              <rect x="4" y="60" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="16" y="60" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="24" y="60" width="4" height="8" fill="#F03220" rx="1" />
              <rect x="40" y="60" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="48" y="60" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="60" y="60" width="4" height="12" fill="currentColor" rx="1" />
              <rect x="68" y="60" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="84" y="60" width="8" height="4" fill="currentColor" rx="1" />

              <rect x="12" y="68" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="36" y="68" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="52" y="68" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="72" y="68" width="4" height="8" fill="currentColor" rx="1" />
              <rect x="80" y="68" width="16" height="4" fill="currentColor" rx="1" />

              <rect x="32" y="76" width="4" height="16" fill="currentColor" rx="1" />
              <rect x="40" y="76" width="12" height="4" fill="currentColor" rx="1" />
              <rect x="60" y="76" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="68" y="76" width="8" height="4" fill="currentColor" rx="1" />

              <rect x="44" y="84" width="24" height="4" fill="currentColor" rx="1" />
              <rect x="72" y="84" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="80" y="84" width="12" height="4" fill="#F03220" rx="1" />

              <rect x="40" y="92" width="4" height="4" fill="currentColor" rx="1" />
              <rect x="48" y="92" width="16" height="4" fill="currentColor" rx="1" />
              <rect x="68" y="92" width="8" height="4" fill="currentColor" rx="1" />
              <rect x="80" y="92" width="4" height="4" fill="currentColor" rx="1" />
            </svg>
          )}

          {/* Sweeping premium neon laser line */}
          <motion.div 
            animate={{ 
              top: ["8%", "82%", "8%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute left-1 right-1 h-[2px] bg-gradient-to-r from-transparent via-[#F03220] to-transparent shadow-[0_0_8px_#F03220] z-20"
          />
        </div>

        {/* Text details for interactive look */}
        <div className="flex flex-col items-start text-left space-y-1.5 py-1">
          <div className="flex items-center gap-1.5" id="qr-title-row">
            <span className="text-xs font-bold text-white tracking-widest uppercase">Scan to Download</span>
            <span className="flex h-1.5 w-1.5 relative" id="live-indicator">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          
          <div className="text-[11px] text-neutral-400 space-y-0.5" id="qr-instruction-short">
            <p>Get the official app for</p>
            <p className="text-white font-semibold">LocalFelo Community</p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[10px] text-neutral-500 font-bold tracking-wider uppercase" id="qr-footer-tags">
            <span className="hover:text-white transition-colors duration-200">iOS</span>
            <span>•</span>
            <span className="hover:text-white transition-colors duration-200">Android</span>
            <ArrowRight className="w-2.5 h-2.5 text-neutral-600 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
