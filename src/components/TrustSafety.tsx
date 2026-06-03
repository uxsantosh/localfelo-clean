import { motion } from "motion/react";
import { ShieldCheck, Star, MapPin, Lock } from "lucide-react";

export default function TrustSafety() {
  const cards = [
    {
      icon: ShieldCheck,
      title: "Identity Verification",
      desc: "Verified profiles help create a safer marketplace by establishing clear government identity authenticity.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/5 hover:border-emerald-500/20 hover:shadow-[0_12px_24px_rgba(16,185,129,0.04)]",
    },
    {
      icon: Star,
      title: "Community Ratings",
      desc: "Users can rate and review completed experiences so you can check user reliability history with full confidence.",
      color: "text-amber-500",
      bg: "bg-amber-500/5 hover:border-amber-500/20 hover:shadow-[0_12px_24px_rgba(245,158,11,0.04)]",
    },
    {
      icon: MapPin,
      title: "Local Connections",
      desc: "Interact only with people from your local community, helping with real walkability proximity matches safely.",
      color: "text-[#F03220]",
      bg: "bg-[#F03220]/5 hover:border-[#F03220]/20 hover:shadow-[0_12px_24px_rgba(240,50,32,0.04)]",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      desc: "Built with user trust and transparency in mind, ensuring encrypted phone calling and localized payment processes.",
      color: "text-blue-500",
      bg: "bg-blue-500/5 hover:border-blue-500/20 hover:shadow-[0_12px_24px_rgba(59,130,246,0.04)]",
    }
  ];

  return (
    <section 
      id="trust-and-safety" 
      className="w-full py-20 border-t border-white/[0.08] bg-black/20 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/5 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              TRUST AT THE CORE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            Built with trust at the core
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            Your safety and security are always our highest priority throughout the entire LocalFelo tasking workflow.
          </p>
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" id="trust-safety-grid">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/5 text-left flex flex-col justify-between space-y-4 transition-all duration-300 ${card.bg}`}
                id={`trust-card-${idx}`}
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-2xl bg-black/50 border border-white/10 inline-flex items-center justify-center ${card.color}`}>
                    <Icon className="w-6 h-6 stroke-[2px]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
