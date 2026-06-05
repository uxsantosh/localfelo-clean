import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, CheckCircle2, Clipboard, ShieldCheck, Wallet, ArrowRight,
  Clock, MapPin, Sparkles, HeartHandshake
} from "lucide-react";

export default function EarnMoney() {
  const [activeStage, setActiveStage] = useState(0);

  const journeyStages = [
    {
      id: 0,
      title: "Task Found",
      icon: Search,
      badge: "Radar Scan",
      desc: "Receive task alert: 'Assemble IKEA couch' for ₹850 inside 1.5km.",
      feloState: "Scanning active...",
      avatarColor: "bg-[#F03220]/10 text-[#F03220] border-[#F03220]/20"
    },
    {
      id: 1,
      title: "Accepted",
      icon: Clipboard,
      badge: "Secured",
      desc: "Accept with one click. Communicate via encrypted safe calling.",
      feloState: "Agreement matched!",
      avatarColor: "bg-neutral-800 text-white border-neutral-700"
    },
    {
      id: 2,
      title: "Completed",
      icon: CheckCircle2,
      badge: "Verification",
      desc: "Complete help request smoothly. Poster checks & signs off securely.",
      feloState: "Task finished!",
      avatarColor: "bg-neutral-850 text-white border-neutral-700"
    },
    {
      id: 3,
      title: "Payment Received",
      icon: Wallet,
      badge: "Credited",
      desc: "₹850 directly deposited to your Felo Wallet. Instantly withdrawable.",
      feloState: "Wallet balance up!",
      avatarColor: "bg-[#F03220]/10 text-[#F03220] border-[#F03220]/20"
    }
  ];

  const benefits = [
    {
      title: "Flexible Schedule",
      desc: "Work when it suits you. No minimum shifts, no clock-ins.",
      accent: "text-[#F03220]",
      bg: "hover:border-[#F03220]/20 hover:bg-[#F03220]/5",
      icon: Clock
    },
    {
      title: "Local Opportunities",
      desc: "No long-distance travel. Find work right within walking distance.",
      accent: "text-[#F03220]",
      bg: "hover:border-[#F03220]/20 hover:bg-[#F03220]/5",
      icon: MapPin
    },
    {
      title: "Extra Income",
      desc: "Put your skills, free time, and helpful attitude to direct value.",
      accent: "text-[#F03220]",
      bg: "hover:border-[#F03220]/20 hover:bg-[#F03220]/5",
      icon: Sparkles
    },
    {
      title: "Community Impact",
      desc: "Help real people around your location while earning fairly.",
      accent: "text-[#F03220]",
      bg: "hover:border-[#F03220]/20 hover:bg-[#F03220]/5",
      icon: HeartHandshake
    }
  ];

  return (
    <section 
      id="earning" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/40 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Flow Journey visualizer container */}
        <div className="lg:col-span-6 w-full space-y-6 order-2 lg:order-1" id="earn-left-col">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161616]/60 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8D2B00]/5 to-[#0D0D0D]/80 -z-10 pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest block bg-[#0D0D0D]/40 border border-white/5 px-3.5 py-1 rounded-full">
                  Interactive Earning Journey
                </span>
                <span className="text-[11px] font-bold text-[#F03220] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F03220] animate-pulse" />
                  Tap phases below to preview
                </span>
              </div>

              {/* Dynamic Step Visualization Area */}
              <div className="h-44 rounded-2xl bg-[#0D0D0D]/50 border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden" id="journey-visualizer-window">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${journeyStages[activeStage].avatarColor}`}>
                          {React.createElement(journeyStages[activeStage].icon, { className: "w-5 h-5 stroke-[2.5px]" })}
                        </div>
                        <div>
                          <span className="text-xs text-neutral-500 font-extrabold font-mono">{journeyStages[activeStage].badge}</span>
                          <h4 className="text-sm font-extrabold text-white leading-tight">
                            {journeyStages[activeStage].title}
                          </h4>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded bg-[#eee]/5 border border-white/[0.04]">
                        <span className="text-[10px] text-neutral-400 font-extrabold font-mono uppercase tracking-widest block">
                          Stage 0{activeStage + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-300 font-semibold leading-relaxed">
                      {journeyStages[activeStage].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-neutral-500 font-bold font-mono">
                  <span>SYSTEM STATUS: <span className="text-[#F03220] uppercase">{journeyStages[activeStage].feloState}</span></span>
                  <span>100% SECURE VIA GATEWAY</span>
                </div>
              </div>

              {/* Interactive Journey Progress Buttons */}
              <div className="grid grid-cols-4 gap-2.5 relative">
                
                {/* Horizontal connector line */}
                <div className="absolute top-[21px] left-8 right-8 h-[2px] bg-neutral-800 -z-10" />

                {journeyStages.map((stg, index) => {
                  const CurrentIcon = stg.icon;
                  const isActive = index === activeStage;
                  return (
                    <button
                      key={stg.id}
                      onClick={() => setActiveStage(index)}
                      className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                    >
                      <div 
                        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? "bg-[#F03220] border-[#F03220] text-white shadow-[0_0_15px_rgba(240,50,32,0.3)] scale-110" 
                            : "bg-[#0D0D0D] border-white/5 text-neutral-500 hover:border-white/20 hover:text-white"
                        }`}
                        id={`journey-flow-dot-${index}`}
                      >
                        <CurrentIcon className="w-5 h-5 stroke-[2px]" />
                      </div>
                      <span className={`text-[10px] font-extrabold text-center transition-colors truncate max-w-full ${isActive ? "text-white" : "text-neutral-500"}`}>
                        {stg.title}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Highlights Mini Cards container */}
          <div className="grid grid-cols-2 gap-4" id="highlights-mini-cards">
            {benefits.map((b, idx) => {
              const CurIcon = b.icon;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl bg-[#161616]/30 border border-white/5 transition-all duration-300 ${b.bg}`}
                  id={`highlight-card-${idx}`}
                >
                  <div className={`p-2 rounded-xl bg-[#0D0D0D]/40 border border-white/5 inline-flex mb-2.5 ${b.accent}`}>
                    <CurIcon className="w-4 h-4 stroke-[2.5px]" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white tracking-tight">{b.title}</h4>
                  <p className="text-[11.5px] text-neutral-500 mt-1 leading-snug font-medium">{b.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Content copy text block */}
        <div className="lg:col-span-6 text-left space-y-6 order-1 lg:order-2" id="earn-right-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              EARN MONEY WITH LOCALFELO
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display leading-[1.12] text-white tracking-tight">
            Turn your free time into extra income
          </h2>

          <div className="space-y-4 text-neutral-400 font-medium text-sm sm:text-base leading-relaxed">
            <p>
              LocalFelo helps you earn by completing nearby tasks for people in your community.
            </p>
            <p>
              No fixed schedules. No long-term commitments. Just secure, trusted local opportunities whenever you choose to turn your radar on.
            </p>
          </div>

          {/* Quick specs checkpoints */}
          <div className="space-y-3.5 pt-2">
            <span className="text-xs text-neutral-500 font-extrabold tracking-wider uppercase block">
              You fully customize your experience:
            </span>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F03220]/10 text-[#F03220] flex items-center justify-center border border-[#F03220]/20 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-sm text-neutral-300 font-semibold">Which tasks to accept</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F03220]/10 text-[#F03220] flex items-center justify-center border border-[#F03220]/20 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-sm text-neutral-300 font-semibold">When you want to work</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F03220]/10 text-[#F03220] flex items-center justify-center border border-[#F03220]/20 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <span className="text-sm text-neutral-300 font-semibold">How often you want to help</span>
              </div>
            </div>
          </div>

          {/* Download helper direct action link */}
          <div className="pt-4">
            <a 
              href="#download"
              className="inline-flex items-center gap-2 group/cta font-extrabold text-sm text-[#F03220] hover:text-white transition-colors"
            >
              <span>Download & Setup Helper Profile</span>
              <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1.5 transition-transform" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
