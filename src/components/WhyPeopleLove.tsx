import { motion } from "motion/react";
import { ShieldAlert, ShieldCheck, MapPin, CalendarHeart, Zap, Orbit } from "lucide-react";

export default function WhyPeopleLove() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Community",
      desc: "Comprehensive Government ID checks and peer reviews ensure that every user is fully authenticated before performing chores.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/5 hover:border-emerald-500/20",
    },
    {
      icon: MapPin,
      title: "Local First",
      desc: "Our radar system works entirely location-first to find people ready to help within walkable distances around your neighborhood.",
      color: "text-[#F03220]",
      bg: "bg-[#F03220]/5 hover:border-[#F03220]/20",
    },
    {
      icon: CalendarHeart,
      title: "Flexible Earning",
      desc: "No shifts or minimum quotas. Set up your earning account, scan local tasks, and work completely on your own clock.",
      color: "text-amber-500",
      bg: "bg-amber-500/5 hover:border-amber-500/20",
    },
    {
      icon: Zap,
      title: "Fast Assistance",
      desc: "Get critical help when you need it. Solicit responses on your active timeline posts within mere minutes from your neighbor crew.",
      color: "text-blue-500",
      bg: "bg-blue-500/5 hover:border-blue-500/20",
    }
  ];

  return (
    <section 
      id="why-us" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/20 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Header Block alignment */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-white/5 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              WHY LOCALFELO
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            Built for everyday life
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            Designed to bring local communities together through trust, speed, and shared opportunity.
          </p>
        </div>

        {/* Feature Bento-style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" id="why-love-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`p-8 rounded-3xl bg-[#161616]/40 border border-white/5 flex flex-col sm:flex-row gap-6 text-left transition-all duration-300 ${feat.bg}`}
                id={`feature-card-${idx}`}
              >
                {/* Icon wrapper inside */}
                <div className="shrink-0">
                  <div className={`p-4 rounded-2xl bg-[#0D0D0D]/40 border border-white/5 inline-flex items-center justify-center ${feat.color}`}>
                    <Icon className="w-6 h-6 stroke-[2px]" />
                  </div>
                </div>

                {/* Text details inside */}
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                    {feat.desc}
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
