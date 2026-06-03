import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, FileText, ArrowRight, IndianRupee, Bell, UserCheck, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function HowToGetHelp() {
  const [activeStep, setActiveStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 284; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Auto-cycle active highlight for subtle elegant motion
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Add Money To Wallet",
      text: "Add task budget",
      icon: Wallet,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.18)"
    },
    {
      title: "Create Task",
      text: "Add details & photos",
      icon: FileText,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.18)"
    },
    {
      title: "Set Budget & Post",
      text: "Publish task",
      icon: IndianRupee,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.18)"
    },
    {
      title: "Receive Interest",
      text: "Nearby helpers respond",
      icon: Bell,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.18)"
    },
    {
      title: "Choose Helper",
      text: "Select the best match",
      icon: UserCheck,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.18)"
    },
    {
      title: "Task Completed",
      text: "Get your work done",
      icon: ShieldCheck,
      color: "from-neutral-900 to-black hover:border-[#F03220]/50",
      accentGlow: "rgba(240, 50, 32, 0.22)"
    }
  ];

  return (
    <section 
      id="how-to-get-help" 
      className="w-full py-12 md:py-24 bg-black border-t border-neutral-900 relative overflow-hidden z-20"
    >
      {/* Premium ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(240,50,32,0.06)_0%,transparent_75%)] blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(240,50,32,0.03)_0%,transparent_75%)] blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-8 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 mb-2">
            <span className="text-[10px] font-bold text-[#F03220] uppercase tracking-widest">Requester Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
            How To <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#F03220]">Get Help</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-normal tracking-wide font-sans max-w-lg mx-auto">
            Post a task and choose the right helper nearby. Get your work done in minutes.
          </p>
        </div>

        {/* Small Navigation Arrows for Swipe / Slider Navigation (Mobile Only) */}
        <div className="md:hidden flex justify-between items-center gap-4 mb-6">
          <button 
            onClick={() => scrollContainer("left")} 
            className="p-2.5 rounded-full border border-neutral-800 bg-neutral-950/80 text-white active:bg-neutral-900 focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-[#F03220]" />
          </button>
          <span className="text-[9px] font-mono font-extrabold tracking-widest text-[#F03220] uppercase">SWIPE TO NAVIGATE</span>
          <button 
            onClick={() => scrollContainer("right")} 
            className="p-2.5 rounded-full border border-neutral-800 bg-neutral-950/80 text-white active:bg-neutral-900 focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-[#F03220]" />
          </button>
        </div>

        {/* 6-Step Horizontal Progress Tracker */}
        <div 
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-6 gap-6 relative overflow-x-auto pb-4 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none" 
          id="help-steps-timeline"
        >
          
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeStep === idx;
            
            return (
              <div 
                key={idx} 
                onClick={() => setActiveStep(idx)}
                className="relative group text-left cursor-pointer select-none space-y-4 font-sans shrink-0 w-[260px] snap-center md:w-auto md:shrink"
                id={`how-help-step-${idx}`}
              >
                {/* Visual interface simulation container - CRED premium styling */}
                <div className={`relative h-44 rounded-2xl bg-[#090909] border transition-all duration-500 overflow-hidden flex flex-col items-center justify-center ${
                  isCurrent 
                    ? "border-[#F03220]/40 bg-gradient-to-b from-[#120808] to-black shadow-[0_15px_35px_rgba(240,50,32,0.1)]" 
                    : "border-neutral-900 group-hover:border-neutral-800"
                }`}>
                  
                  {/* Subtle Neon Center Glow */}
                  {isCurrent && (
                    <motion.div 
                      layoutId="glowHelp"
                      className="absolute w-32 h-32 rounded-full blur-[40px] pointer-events-none"
                      style={{ backgroundColor: st.accentGlow }}
                    />
                  )}

                  {/* Clean Icon Container with Minimal styling */}
                  <div className={`relative z-10 p-5 rounded-full border transition-all duration-500 ${
                    isCurrent 
                      ? "bg-neutral-950/80 border-[#F03220]/30 scale-110 text-[#F03220] shadow-[0_0_15px_rgba(240,50,32,0.15)]" 
                      : "bg-transparent border-transparent text-neutral-600 group-hover:text-neutral-400 group-hover:scale-105"
                  }`}>
                    <Icon className="w-8 h-8 stroke-[1.5px]" />
                  </div>

                  {/* Tiny step index number */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`text-[10px] font-mono font-bold transition-colors duration-300 ${isCurrent ? "text-[#F03220]/60" : "text-neutral-600"}`}>0{idx + 1}</span>
                  </div>

                  {/* Bottom Minimal active line indicating system state */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-950">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#F03220] to-red-500"
                      initial={{ width: "0%" }}
                      animate={{ width: isCurrent ? "100%" : "0%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Info block */}
                <div className="px-1 text-center space-y-1">
                  <h4 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                    isCurrent ? "text-[#F03220]" : "text-neutral-400 group-hover:text-neutral-200"
                  }`}>
                    {st.title}
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium group-hover:text-neutral-400 transition-colors duration-300">
                    {st.text}
                  </p>
                </div>

                {/* Arrow Connector for larger screens */}
                {idx < 5 && (
                  <div className="hidden md:block absolute top-[85px] -right-3 translate-x-1/2 z-10 text-neutral-800 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5px]" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
