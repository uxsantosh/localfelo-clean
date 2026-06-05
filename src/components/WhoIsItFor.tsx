import { motion } from "motion/react";
import { GraduationCap, Briefcase, Users, Laptop, Home, Heart } from "lucide-react";

export default function WhoIsItFor() {
  const targets = [
    {
      icon: GraduationCap,
      role: "Students",
      desc: "Need help moving, quick deliveries, or local errands. Also find flexible part-time earning opportunities that respect busy study schedules.",
      color: "text-[#F03220]",
      borderBg: "hover:border-[#F03220]/20 hover:bg-[#F03220]/5"
    },
    {
      icon: Briefcase,
      role: "Working Professionals",
      desc: "Save valuable time by delegating everyday household tasks, office chores, and pick-ups to verified helpers in your local neighborhood.",
      color: "text-amber-500",
      borderBg: "hover:border-amber-500/20 hover:bg-amber-500/5"
    },
    {
      icon: Users,
      role: "Families",
      desc: "Find immediate, trustworthy nearby help for daily household activities, furniture assembly, packing assistance, and local supermarket runs.",
      color: "text-emerald-500",
      borderBg: "hover:border-emerald-500/20 hover:bg-emerald-500/5"
    },
    {
      icon: Laptop,
      role: "Freelancers",
      desc: "Supplement your primary contract gigs and earn extra revenue streams by taking up physical help requests directly within your workspace radial.",
      color: "text-blue-500",
      borderBg: "hover:border-blue-500/20 hover:bg-blue-500/5"
    },
    {
      icon: Home,
      role: "Homemakers",
      desc: "Unlock versatile, risk-free opportunities to contribute to your home's earnings using available spare slots throughout the day.",
      color: "text-rose-500",
      borderBg: "hover:border-rose-500/20 hover:bg-rose-500/5"
    },
    {
      icon: Heart,
      role: "Retirees",
      desc: "Stay healthily connected and active in the neighborhood, aid others in need, and supplement your income with lightweight community tasks.",
      color: "text-violet-500",
      borderBg: "hover:border-violet-500/20 hover:bg-violet-500/5"
    }
  ];

  return (
    <section 
      id="who-is-it-for" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/40 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        {/* Title Heading info */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-white/5 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              WHO USES LOCALFELO
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            Built for anyone who needs help or wants to earn
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            A trusted marketplace designed to match community helpers with real task posters safely.
          </p>
        </div>

        {/* Premium Bento/Grid Visual List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" id="who-it-is-for-grid">
          {targets.map((tgt, idx) => {
            const Icon = tgt.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`p-6 rounded-3xl bg-[#161616]/30 border border-white/5 flex flex-col items-start text-left gap-4 transition-all duration-300 ${tgt.borderBg}`}
                id={`role-card-${idx}`}
              >
                <div className={`p-3 rounded-2xl bg-[#0D0D0D]/50 border border-white/10 ${tgt.color}`}>
                  <Icon className="w-6 h-6 stroke-[2px]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {tgt.role}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
                    {tgt.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
