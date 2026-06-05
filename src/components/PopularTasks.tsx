import { motion } from "motion/react";
import { 
  ShoppingCart, Package, Truck, Sparkles, Wrench, ShoppingBag, 
  Heart, Calendar, Hourglass, FileText, Box, ClipboardCheck 
} from "lucide-react";

export default function PopularTasks() {
  const categories = [
    {
      icon: ShoppingCart,
      title: "Grocery Delivery",
      desc: "Instant supermarket and fresh food deliveries to your doorstep from nearby stores.",
      color: "text-rose-500",
      accent: "rgba(244, 63, 94, 0.15)"
    },
    {
      icon: Package,
      title: "Parcel Pickup",
      desc: "Courier drops, retail pickup lines, and cross-neighborhood dispatch run smoothly.",
      color: "text-blue-500",
      accent: "rgba(59, 130, 246, 0.15)"
    },
    {
      icon: Truck,
      title: "Furniture Moving",
      desc: "Getting a hand with heavy lifting, dynamic transit, and direct shifting within corridors.",
      color: "text-amber-500",
      accent: "rgba(245, 158, 11, 0.15)"
    },
    {
      icon: Sparkles,
      title: "Home Cleaning Assistance",
      desc: "Deep spot cleaning, household help, and quick cleanup chores handled with care.",
      color: "text-emerald-500",
      accent: "rgba(16, 185, 129, 0.15)"
    },
    {
      icon: Wrench,
      title: "Assembly Help",
      desc: "Fast furniture setup, electronic installations, and general handiwork help.",
      color: "text-purple-500",
      accent: "rgba(168, 85, 247, 0.15)"
    },
    {
      icon: ShoppingBag,
      title: "Local Shopping",
      desc: "Pickups from specific boutique shops, medicine stores, or custom bakeries.",
      color: "text-[#F03220]",
      accent: "rgba(240, 50, 32, 0.15)"
    },
    {
      icon: Heart,
      title: "Pet Walking",
      desc: "Dog walking, afternoon pet checking, and feed drops inside neighbor hubs.",
      color: "text-pink-500",
      accent: "rgba(236, 72, 153, 0.15)"
    },
    {
      icon: Calendar,
      title: "Event Assistance",
      desc: "Venue setup, local logistics management, and hands-on operational help.",
      color: "text-[#fff0ed]",
      accent: "rgba(255, 240, 237, 0.15)"
    },
    {
      icon: Hourglass,
      title: "Queue Standing",
      desc: "Save your precious hours; hire local help to stand in lines for paperwork or events.",
      color: "text-cyan-500",
      accent: "rgba(6, 182, 212, 0.15)"
    },
    {
      icon: FileText,
      title: "Document Delivery",
      desc: "Trusted, quick delivery of secure files, signatures, and essential paper envelopes.",
      color: "text-indigo-500",
      accent: "rgba(99, 102, 241, 0.15)"
    },
    {
      icon: Box,
      title: "Packing & Unpacking",
      desc: "Speed up shifting. Get structural organizing and boxing assistance easily.",
      color: "text-yellow-500",
      accent: "rgba(234, 179, 8, 0.15)"
    },
    {
      icon: ClipboardCheck,
      title: "General Errands",
      desc: "Utility payments, tailor drop-offs, keys rescue, and tiny essential task sorting.",
      color: "text-teal-500",
      accent: "rgba(20, 184, 166, 0.15)"
    }
  ];

  return (
    <section 
      id="popular-tasks" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/20 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        
        {/* Title Block info */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-white/5 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              POPULAR SOLUTIONS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            Thousands of everyday tasks can be completed through LocalFelo
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            From minor errands to heavy household help, find neighbors willing to tackle any secure, authenticated tasks.
          </p>
        </div>

        {/* Categories grid block for SEO indexability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" id="tasks-category-grid">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, borderColor: cat.color }}
                className="p-6 rounded-3xl bg-[#161616]/40 border border-white/5 text-left space-y-4 transition-all duration-300 relative overflow-hidden group"
                id={`task-category-card-${idx}`}
              >
                {/* Micro accent color blob in background */}
                <div 
                  className="absolute -top-12 -right-12 w-24 h-24 rounded-full filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" 
                  style={{ backgroundColor: cat.color }}
                />

                <div 
                  className="p-3 rounded-2xl inline-flex items-center justify-center border border-white/5"
                  style={{ backgroundColor: cat.accent }}
                >
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-[#F03220] transition-colors leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    {cat.desc}
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
