import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQsProps {
  onNavigate?: (path: string) => void;
}

export default function FAQs({ onNavigate }: FAQsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "How does LocalFelo work?",
      answer: "Create a task with details and a budget. Local verified helpers nearby will be alerted and can show interest. Review reviews and verify identity to match instantly, complete the task, and release secure payment."
    },
    {
      question: "Is LocalFelo safe for everyone?",
      answer: "Yes, absolutely. Every user passes secure identity screening including verified documents (Aadhaar or PAN) and selfie match checks. Communications are kept private within the app."
    },
    {
      question: "How do local helpers earn money?",
      answer: "Browse community chores, deliveries, repair tasks, and tutoring sessions posted in your neighborhood. Apply to gigs you like, get selected, complete the job, and cash out securely."
    },
    {
      question: "What kind of tasks can I post?",
      answer: "Any legal, safe neighborhood help! Most common tasks include grocery picking, quick home assembly, kitchen cleaning, laundry drop-offs, event logistics, and basic local computer support."
    }
  ];

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section 
      id="faqs" 
      className="w-full py-12 md:py-24 bg-transparent border-t border-white/[0.08] relative z-20 font-sans overflow-hidden"
    >
      {/* High-fidelity premium background glows for depth */}
      <div className="absolute top-1/4 left-1/3 -translate-y-1/2 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] rounded-full bg-[#F03220]/[0.06] blur-[90px] sm:blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/3 translate-y-1/2 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-amber-500/[0.03] blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      
      {/* Ultra-subtle secondary central gradient focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,50,32,0.025)_0%,rgba(13,13,13,0)_65%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 relative z-10">
        
        {/* Section Title */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-normal tracking-wide">
            Find quick answers to commonly asked questions about using the LocalFelo community marketplace.
          </p>
        </div>

        {/* Premium Accordion List Grid */}
        <div className="space-y-3" id="faqs-accordion-container">
          {faqData.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? "bg-[#1A1A1A] border-neutral-800 shadow-[0_12px_24px_rgba(0,0,0,0.6)]" 
                    : "bg-[#161616] border-neutral-900 hover:border-neutral-800"
                }`}
                id={`faq-accordion-card-${idx}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-neutral-300 hover:text-white focus:outline-none transition-colors"
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
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed border-t border-neutral-900">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Dynamic View All FAQs CTA button */}
        {onNavigate && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => onNavigate("/faqs")}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-neutral-800 bg-[#121212] hover:border-[#F03220]/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-pointer"
              id="view-all-faqs-btn"
            >
              <span>View All FAQs</span>
              <ArrowRight className="w-4 h-4 text-[#F03220] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
