import { motion } from "motion/react";
import { Users, MapPin, Heart, Share2, Award, Sparkles } from "lucide-react";

export default function CommunityNeed() {
  return (
    <section 
      id="community-need" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/20 relative z-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Copy Content Details */}
        <div className="lg:col-span-6 text-left space-y-6" id="community-left-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-500">
              COMMUNITY FIRST
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display leading-[1.12] text-white tracking-tight">
            Helping neighbors connect, support, and grow together
          </h2>

          <div className="space-y-4 text-neutral-400 font-medium text-sm sm:text-base leading-relaxed">
            <p>
              Many everyday tasks don't require large service companies. Often, someone nearby is already willing and capable of helping. 
            </p>
            <p>
              LocalFelo creates trusted local connections that benefit both sides, transforming pure services into meaningful neighborhood support mechanisms.
            </p>
          </div>

          {/* Bullet specifications blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4" id="community-pro-grid">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[#161616]/40 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Help Faster</h4>
              <p className="text-[11px] text-neutral-400 leading-normal font-medium">Get immediate hand issues fixed quickly by helpers nearby.</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[#161616]/40 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Earn Extra</h4>
              <p className="text-[11px] text-neutral-400 leading-normal font-medium">Keep capital inside local zones, supporting neighborhoods.</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[#161616]/40 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Stronger Zones</h4>
              <p className="text-[11px] text-neutral-400 leading-normal font-medium">Fostering secure bonds over real-life helpful actions.</p>
            </div>
          </div>

        </div>

        {/* Right Column: Beautiful Community Map abstract connection graphic */}
        <div className="lg:col-span-6 w-full flex justify-center" id="community-right-col">
          <div className="relative w-full max-w-md aspect-square rounded-3xl bg-[#161616]/40 border border-white/5 shadow-2xl overflow-hidden p-6 flex flex-col items-center justify-center">
            
            {/* Top-right low ambient spot gradient */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />

            {/* Simulated interactive connection canvas nodes mesh */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Central Radar Circle */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-neutral-800/80 animate-[spin_40s_linear_infinite]" />
              <div className="absolute w-[180px] h-[180px] rounded-full border border-neutral-800/40" />
              <div className="absolute w-[90px] h-[90px] rounded-full border border-emerald-500/20" />

              {/* Dynamic Connecting Lines representation (abstract absolute vectors) */}
              <svg className="absolute inset-0 w-full h-full stroke-emerald-500/20 stroke-1 pointer-events-none" viewBox="0 0 100 100">
                <line x1="18" y1="20" x2="50" y2="50" />
                <line x1="82" y1="18" x2="50" y2="50" className="stroke-rose-500/20" />
                <line x1="85" y1="75" x2="50" y2="50" />
                <line x1="15" y1="80" x2="50" y2="50" className="stroke-amber-500/20" />
              </svg>

              {/* Floating Node 1: Helper Rajesh (Top Left) */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[10%] flex items-center gap-2 p-2.5 rounded-2xl bg-[#161616] border border-white/10 shadow-lg"
              >
                <div className="w-7 h-7 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono border border-emerald-500/30">
                  R
                </div>
                <div>
                  <h5 className="text-[10px] font-extrabold text-white leading-none">Rajesh H.</h5>
                  <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">₹350 Paid</span>
                </div>
              </motion.div>

              {/* Floating Node 2: Poster Mukesh (Center Hub) */}
              <div className="absolute top-[42%] left-[40%] flex flex-col items-center">
                <span className="flex h-4 w-4 relative mb-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F03220] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F03220]"></span>
                </span>
                <span className="bg-[#0D0D0D] text-[9px] font-extrabold text-white px-2 py-1 rounded bg-neutral-900 border border-white/10 whitespace-nowrap">
                  Marathahalli Hub
                </span>
              </div>

              {/* Floating Node 3: Helper Priya (Top Right) */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[12%] right-[8%] flex items-center gap-2 p-2.5 rounded-2xl bg-[#161616] border border-white/10 shadow-lg"
              >
                <div className="w-7 h-7 bg-rose-500/20 text-rose-500 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono border border-rose-500/30">
                  P
                </div>
                <div>
                  <h5 className="text-[10px] font-extrabold text-white leading-none">Priya K.</h5>
                  <span className="text-[8px] text-[#F03220] font-bold block mt-0.5 animate-pulse">Delivering...</span>
                </div>
              </motion.div>

              {/* Floating Node 4: Helper Amit (Bottom Right) */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[20%] right-[10%] flex items-center gap-2 p-2.5 rounded-2xl bg-[#161616] border border-white/10 shadow-lg"
              >
                <div className="w-7 h-7 bg-amber-500/20 text-amber-500 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono border border-amber-500/30">
                  A
                </div>
                <div>
                  <h5 className="text-[10px] font-extrabold text-white leading-none">Amit S.</h5>
                  <span className="text-[8px] text-amber-500 font-bold block mt-0.5">Assembled Couch</span>
                </div>
              </motion.div>

              {/* Floating Node 5: Active Radar Scanner Pin (Bottom Left) */}
              <motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[15%] left-[8%] p-2 rounded-xl bg-[#161616] border border-white/10 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] text-neutral-400 font-bold uppercase font-mono">5Helpers nearby</span>
              </motion.div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
