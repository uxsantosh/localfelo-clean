export default function DownloadCTA() {
  return (
    <section 
      id="download" 
      className="w-full py-12 md:py-24 border-t border-neutral-900 bg-black relative z-20 overflow-hidden"
    >
      {/* Background soft glowing effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neutral-800/10 rounded-full filter blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8 relative">
        
        {/* Heading */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans">
            Ready to get help or start earning?
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-normal tracking-wide max-w-lg mx-auto font-sans">
            Join your local community today.
          </p>
        </div>

        {/* Buttons grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4" id="download-cta-buttons">
          
          {/* App Store button */}
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-neutral-200 transition-colors shadow-2xl shrink-0 text-left font-sans"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.6.69-1.12 1.84-.98 2.95 1.1.09 2.22-.57 2.91-1.38z" />
            </svg>
            <div>
              <span className="text-[9px] font-bold tracking-wider uppercase opacity-60 block leading-none">
                DOWNLOAD ON THE
              </span>
              <span className="text-sm font-black tracking-tight">App Store</span>
            </div>
          </a>

          {/* Google Play button */}
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-black border border-neutral-800 text-white font-extrabold text-sm hover:bg-neutral-900 hover:border-neutral-700 transition-all shadow-2xl shrink-0 text-left font-sans"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M30 19c-3.6 3.6-6 9.6-6 18v438c0 8.4 2.4 14.4 6 18l1 1L282 256L31 5a5 5 0 00-1-1L30 19z" />
              <path fill="#EA4335" d="M282 256L31 507c7 4 17 4 25-1l306-174L282 256z" />
              <path fill="#34A853" d="M362 131L56 7c-8-5-18-5-25-1l251 250l80-81z" />
              <path fill="#FBBC05" d="M362 325l100-57c12-7 12-18 0-25l-100-57L282 256l80 69z" />
            </svg>
            <div>
              <span className="text-[9px] font-bold tracking-wider uppercase opacity-60 block leading-none">
                GET IT ON
              </span>
              <span className="text-sm font-black tracking-tight">Google Play</span>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
}
