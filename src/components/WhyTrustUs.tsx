import { motion } from "motion/react";
import { ShieldCheck, Star, Lock, Users } from "lucide-react";
import Logo from "./Logo";

export default function WhyTrustUs() {
  const trustCards = [
    {
      title: "Verified Identity",
      tagline: "Aadhaar verification ensures safe interactions.",
      icon: ShieldCheck
    },
    {
      title: "Ratings & Reviews",
      tagline: "Community reputation builds trust for every task.",
      icon: Star
    },
    {
      title: "Secure Payments",
      tagline: "Protected transactions held safely until job is completed.",
      icon: Lock
    },
    {
      title: "Local Community",
      tagline: "Real nearby people ready to extend immediate help.",
      icon: Users
    }
  ];

  return (
    <section 
      id="why-trust-us" 
      className="w-full py-12 md:py-24 bg-transparent border-t border-neutral-900 relative overflow-hidden z-20"
    >
      {/* Premium brand ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(240,50,32,0.06)_0%,transparent_75%)] blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(240,50,32,0.03)_0%,transparent_75%)] blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 mb-2">
            <span className="text-[10px] font-bold text-[#F03220] uppercase tracking-widest font-mono">Trust & Safety</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5">
            <span>Why People Trust</span>
            <Logo className="h-8 sm:h-11 w-auto text-white" />
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-normal tracking-wide font-sans">
            Safe, authenticated, and localized interactions built for community harmony.
          </p>
        </div>

        {/* 4 Trust Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="trust-cards-grid">
          {trustCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4, borderColor: "rgba(240, 50, 32, 0.3)" }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-2xl bg-[#161616] border border-neutral-900 flex flex-col items-center justify-between text-center gap-6 relative overflow-hidden group font-sans"
                id={`trust-integrity-card-${idx}`}
              >
                {/* Subtle Radial Center Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,50,32,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Visual Icon - CRED Style Simple Outline inside brand style active containers */}
                <div className="p-4 rounded-full border border-neutral-900 bg-[#1A1A1A] text-neutral-500 group-hover:text-[#F03220] group-hover:border-[#F03220]/30 shadow-[0_0_15px_rgba(240,50,32,0.1)] group-hover:bg-[#1A1A1A]/80 transition-all duration-500">
                  <Icon className="w-6 h-6 stroke-[1.5px]" />
                </div>

                {/* Info Block */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-red-500 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                    {card.tagline}
                  </p>
                </div>

                {/* Bottom slide action boundary bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F03220]/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 pointer-events-none" />

                {/* Aesthetic status dot representing silent verification */}
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 absolute top-4 right-4 group-hover:bg-[#F03220] transition-colors duration-300 shadow-[0_0_8px_rgba(240,50,32,0)] group-hover:shadow-[0_0_8px_rgba(240,50,32,0.8)]" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
