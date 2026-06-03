import { motion } from "motion/react";
import { Plus, AppWindow, ArrowRight, ShieldCheck, Check, Zap, Coins } from "lucide-react";

export default function TwoWaysSection() {
  const getHelpExamples = [
    "Grocery delivery",
    "Furniture moving",
    "Parcel pickup",
    "Home assistance",
    "Local errands"
  ];

  const earnMoneyBenefits = [
    "When to work & setup schedules",
    "Which nearby tasks to accept",
    "How often you step out & help"
  ];

  return (
    <section 
      id="how-it-benefits" 
      className="w-full py-20 border-t border-white/[0.08] bg-black/20 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              POWERFUL SOLUTIONS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            One app. Two powerful ways to benefit.
          </h2>
        </div>

        {/* Two Premium Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto" id="two-ways-grid">
          
          {/* Card 1: Get Help */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-col justify-between p-8 rounded-3xl bg-neutral-900/60 border border-white/5 shadow-2xl overflow-hidden hover:border-[#F03220]/20 hover:shadow-[0_20px_40px_rgba(240,50,32,0.1)] group text-left transition-all duration-350"
            id="benefit-card-get-help"
          >
            {/* Top Glow Accent Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F03220]/5 rounded-full filter blur-2xl group-hover:bg-[#F03220]/10 transition-colors pointer-events-none" />

            <div className="space-y-6">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#F03220]/10 text-[#F03220] border border-[#F03220]/20">
                  <Zap className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-xs text-neutral-500 font-extrabold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  POSTER SIDE
                </span>
              </div>

              {/* Title & Underline */}
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
                  Get Help
                </h3>
                <p className="text-[#F03220] font-extrabold text-sm uppercase tracking-wide">
                  Need help with something?
                </p>
              </div>

              {/* Description */}
              <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                Create a task, set your budget, and receive interest from nearby verified people. Choose the helper you prefer and get things done quickly.
              </p>

              {/* Tag Examples */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-neutral-500 font-extrabold tracking-wider uppercase block">
                  Popular tasks:
                </span>
                <div className="flex flex-wrap gap-2">
                  {getHelpExamples.map((ex, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/5 transition-colors font-semibold"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Button Action */}
            <div className="mt-8 pt-4 border-t border-white/[0.04]">
              <a 
                href="#download"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-black font-extrabold text-sm shadow-md hover:bg-neutral-150 transition-colors group/btn"
              >
                <span>Create a Task</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>

          </motion.div>

          {/* Card 2: Earn Money */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-col justify-between p-8 rounded-3xl bg-neutral-900/60 border border-white/5 shadow-2xl overflow-hidden hover:border-amber-500/20 hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] group text-left transition-all duration-350"
            id="benefit-card-earn-money"
          >
            {/* Top Glow Accent Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

            <div className="space-y-6">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Coins className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-xs text-neutral-500 font-extrabold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  HELPER SIDE
                </span>
              </div>

              {/* Title & Underline */}
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
                  Earn Money
                </h3>
                <p className="text-amber-500 font-extrabold text-sm uppercase tracking-wide">
                  Have free time?
                </p>
              </div>

              {/* Description */}
              <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                Accept nearby tasks, help people around you, and earn money for every completed task. Spend or transfer your earnings instantly.
              </p>

              {/* Deciding Factors Checklist */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-neutral-500 font-extrabold tracking-wider uppercase block">
                  You decide fully:
                </span>
                <div className="space-y-2">
                  {earnMoneyBenefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="p-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                      <span className="text-xs text-neutral-300 font-bold">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Button Action */}
            <div className="mt-8 pt-4 border-t border-white/[0.04]">
              <a 
                href="#download"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-neutral-800 text-white font-extrabold text-sm border border-white/10 shadow-md hover:bg-neutral-700 hover:border-white/20 transition-all duration-300 group/btn"
              >
                <span>Start Earning</span>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
