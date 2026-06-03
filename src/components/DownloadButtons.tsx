import { motion } from "motion/react";

export default function DownloadButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 w-full max-w-lg mx-auto" id="download-actions-row">
      {/* App Store Download Button */}
      <motion.a
        href="#download"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-black border border-neutral-200/50 shadow-[0_4px_24px_rgba(255,255,255,0.06)] hover:bg-neutral-50 hover:shadow-[0_8px_32px_rgba(255,255,255,0.12)] transition-all duration-300"
        id="app-store-download-btn"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.6.69-1.12 1.84-.98 2.95 1.1.09 2.22-.57 2.91-1.38z" />
        </svg>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Download on the</span>
          <span className="text-base font-extrabold font-display tracking-tight mt-0.5">App Store</span>
        </div>
      </motion.a>

      {/* Google Play Download Button */}
      <motion.a
        href="#download"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-neutral-900 text-white border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
        id="google-play-download-btn"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M30 19c-3.6 3.6-6 9.6-6 18v438c0 8.4 2.4 14.4 6 18l1 1L282 256L31 5a5 5 0 00-1-1L30 19z" />
          <path fill="#EA4335" d="M282 256L31 507c7 4 17 4 25-1l306-174L282 256z" />
          <path fill="#34A853" d="M362 131L56 7c-8-5-18-5-25-1l251 250l80-81z" />
          <path fill="#FBBC05" d="M362 325l100-57c12-7 12-18 0-25l-100-57L282 256l80 69z" />
        </svg>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">GET IT ON</span>
          <span className="text-base font-extrabold font-display tracking-tight mt-0.5">Google Play</span>
        </div>
      </motion.a>
    </div>
  );
}
