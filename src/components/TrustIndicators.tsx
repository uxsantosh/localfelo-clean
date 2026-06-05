import { motion } from "motion/react";
import { Users, ShieldCheck, HeartHandshake, Handshake } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: Users,
      title: "Verified users",
      desc: "Every profile checked & verified",
      color: "text-[#F03220]",
      bg: "bg-[#F03220]/5 border-[#F03220]/10",
    },
    {
      icon: ShieldCheck,
      title: "Secure ID system",
      desc: "Instant bio-mapped vetting",
      color: "text-amber-500",
      bg: "bg-amber-500/5 border-amber-500/10",
    },
    {
      icon: HeartHandshake,
      title: "Community powered",
      desc: "Neighbors helping neighbors",
      color: "text-rose-500",
      bg: "bg-rose-500/5 border-rose-500/10",
    },
    {
      icon: Handshake,
      title: "Real people, real help",
      desc: "Zero robots. Pure local support",
      color: "text-emerald-500",
      bg: "bg-emerald-500/5 border-emerald-500/10",
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6" id="trust-indicators-grid">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicators.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
              whileHover={{ y: -4, borderColor: "rgba(240, 50, 32, 0.2)" }}
              className={`flex flex-col items-center justify-center text-center p-5 rounded-2xl border bg-[#161616]/40 backdrop-blur-md transition-all duration-300 ${item.bg}`}
              id={`trust-card-${idx}`}
            >
              <div className={`p-3 rounded-full bg-[#0D0D0D]/40 border border-white/5 mb-3 ${item.color}`}>
                <Icon className="w-5 h-5 stroke-[2px]" />
              </div>
              <h4 className="text-sm font-extrabold text-white tracking-tight">{item.title}</h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-normal max-w-[150px]">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
