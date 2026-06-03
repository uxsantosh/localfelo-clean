import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string | ReactNode;
}

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "What is LocalFelo?",
      answer: "LocalFelo is a hyperlocal task marketplace where people can get help from nearby individuals or earn money by helping others."
    },
    {
      question: "How do I create a task?",
      answer: "Create a task, add details, set your budget, and nearby helpers can show interest. You choose who you want to work with."
    },
    {
      question: "How do I earn money?",
      answer: "Browse nearby tasks, show interest in tasks you can help with, get selected, complete the task, and receive payment."
    },
    {
      question: "Do I need identity verification?",
      answer: "Yes. Identity verification helps build trust and safety for everyone using the platform."
    },
    {
      question: "Is LocalFelo available in my city?",
      answer: "LocalFelo is designed for local communities and continues expanding to more locations."
    },
    {
      question: "What kind of tasks can I post or fulfill?",
      answer: (
        <div className="space-y-3 text-neutral-400 font-normal">
          <p className="text-neutral-300 font-semibold mb-2">
            You can post virtually any safe, local, and legal task! To help you understand, here is a prioritized breakdown of the most common tasks posted in real-world on-demand apps:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">🚚 Pickup & Delivery</span>
              <span className="text-neutral-500 text-xs leading-relaxed"> Dunzo-style quick store runs, package drop-offs, grocery picking, or document delivery.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">🔧 Home Repairs & Assembly</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Furniture assembly, simple plumbing, bulb replacements, wall mounting, or appliance help.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">🏡 Cleaning & Domestic Help</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Office/house cleaning, kitchen cleaning, dishwashing, laundry, ironing, or backyard clearing.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">📦 Moving & Heavy Lifting</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Loading/unloading rental trucks, moving boxes, shifting heavy furniture, or packing assistance.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">🍳 Cooking & Home Chefs</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Daily meal preparation, baking, party catering support, or kitchen assistance for events.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">🐾 Pet Care & Walking</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Dog walking, pet sitting when away, feeding, basic pet grooming, or Vet clinic companion.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">📸 Videography & Photo</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Local event photography, family portraits, video editing, or drone videography services.</span>
            </li>
            <li className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[#F03220] font-bold text-xs sm:text-sm font-mono">💻 Training & Tech Assist</span>
              <span className="text-neutral-500 text-xs leading-relaxed">Helping elders use digital apps, tutoring students, setting up smart TV/Wifi, or basic computer support.</span>
            </li>
          </ul>
          <p className="text-neutral-500 text-xs pt-1 italic">
            Whether you need a quick 30-minute hand or complex multi-hour project assistance, LocalFelo has a helper ready nearby.
          </p>
        </div>
      )
    },
    {
      question: "Can I reject a helper?",
      answer: "Yes. You choose which interested helper you want to work with."
    },
    {
      question: "Can I cancel a task?",
      answer: "Yes. Tasks can be cancelled based on the task stage and platform policies."
    },
    {
      question: "How are payments handled?",
      answer: "Payments are processed securely through the platform according to LocalFelo payment policies."
    },
    {
      question: "Is LocalFelo safe?",
      answer: "LocalFelo includes identity verification, ratings, reviews, and trust mechanisms designed to improve user safety."
    }
  ];

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section 
      id="faqs" 
      className="w-full py-12 md:py-24 bg-black border-t border-neutral-900 relative z-20 font-sans"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 md:space-y-16">
        
        {/* Section Title */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-normal tracking-wide">
            Find answers to commonly asked questions about using the LocalFelo marketplace.
          </p>
        </div>

        {/* Premium Accordion List Grid without colored accent highlights */}
        <div className="space-y-3" id="faqs-accordion-container">
          {faqData.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? "bg-[#080808] border-neutral-800 shadow-[0_12px_24px_rgba(0,0,0,0.6)]" 
                    : "bg-[#050505] border-neutral-900 hover:border-neutral-800"
                }`}
                id={`faq-accordion-card-${idx}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm sm:text-base text-neutral-300 hover:text-white focus:outline-none transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 leading-tight">
                    {faq.question}
                  </span>
                  
                  {/* Chevron indicator */}
                  <div className={`p-1 rounded-full shrink-0 transition-all ${isOpen ? "text-white" : "text-neutral-600"}`}>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed border-t border-neutral-900">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
