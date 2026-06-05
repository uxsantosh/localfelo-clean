import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Search, Shield, Sparkles, HelpCircle, UserCheck, CreditCard, ChevronRight } from "lucide-react";
import { updatePageSEO } from "../utils/seo";

interface FAQsPageProps {
  onNavigate: (path: string, hash?: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Getting Help" | "Earning Money" | "Trust & Safety";
}

export default function FAQsPage({ onNavigate }: FAQsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "General",
      question: "What is LocalFelo?",
      answer: "LocalFelo is a hyperlocal marketplace connecting individuals who need quick, trusted help with reliable local helpers in the immediate neighborhood. From delivery chores to quick home assembly, the platform simplifies on-demand help."
    },
    {
      category: "General",
      question: "Is LocalFelo free to download?",
      answer: "Yes, downloading the LocalFelo mobile app is completely free. There are no registration fees for creating your user profile, browsing open listings, or dispatching requests."
    },
    {
      category: "General",
      question: "Which cities are supported?",
      answer: "We are actively matching community help in cities across India starting from Bangalore. The app lets you check live coverage by using your current coordinates."
    },
    {
      category: "Getting Help",
      question: "How do I request help with a task?",
      answer: "Simply tap 'Create Task' in the app. Enter a direct title, short description, set a fair price, and post. Local, verified helpers nearby will be alerted instantly and can offer their assistance."
    },
    {
      category: "Getting Help",
      question: "Can I choose my favorite helper?",
      answer: "Absolutely. Once neighborhood helpers express interest in your task, you can review their verified status, community rating, completed jobs, and neighborhood feedback before accepting."
    },
    {
      category: "Getting Help",
      question: "What types of tasks can I post?",
      answer: "You can post almost any legal, safe everyday task. Major categories include grocery shopping, laundry runs, package pickups, home repairs, furniture assembly, dog walking, event setup, and senior tech support."
    },
    {
      category: "Getting Help",
      question: "How do I cancel an active task?",
      answer: "You can easily cancel tasks from your task dashboard. If a helper was already matched and dispatched, cancellation policies may apply to compensate them fairly for their travel."
    },
    {
      category: "Earning Money",
      question: "How do I earn money on the app?",
      answer: "Convert your free time or skills into local income by browsing tasks posted near you. Show interest in tasks you can fulfill, get matched, complete the job, and verify work to receive your earnings instantly."
    },
    {
      category: "Earning Money",
      question: "When do I get paid?",
      answer: "Once you complete the task and the owner verifies it, the escrow is immediately released. The funds can be withdrawn straight to your bank account using instant online transfers."
    },
    {
      category: "Earning Money",
      question: "Are there any service fees for helpers?",
      answer: "LocalFelo keeps fees low to maximize your earnings. We charge a small, transparent platform fee on completed transactions to cover secure secure servers, identity screening, and instant payments."
    },
    {
      category: "Trust & Safety",
      question: "Is LocalFelo safe?",
      answer: "Safety is our priority. Every helper passes full digital identity verification. In-app chat coordinates tasks securely without exposing your phone number, and both parties rate each other to ensure community accountability."
    },
    {
      category: "Trust & Safety",
      question: "How is my personal info protected?",
      answer: "All direct personal details, coordinates, and system communications are fully encrypted. We never lease or sell user identity data to general advertising networks or malicious trackers."
    },
    {
      category: "Trust & Safety",
      question: "What is the identity verification process?",
      answer: "Both task owners and local helpers undergo digital verification including identity documents (Aadhaar/PAN) and selfie match algorithms. This ensures every profile represents an actual, trusted person in the real world."
    },
    {
      category: "Trust & Safety",
      question: "What if a task is uncompleted or done poorly?",
      answer: "We support task escrow management. If a dispute arises about completion, our customer response desk facilitates a fair evaluation of communication logs, photos, and chat milestones to resolve disputes objectively."
    }
  ];

  // Dynamically update SEO and set Up Schema.org FAQPage JSON-LD structures for Google
  useEffect(() => {
    const faqSchemaQuestions = faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }));

    updatePageSEO({
      title: "Comprehensive FAQs | LocalFelo Support Hub",
      description: "Got questions? Read our list of answers about task posting, secure escrow payments, safety checks, and neighborhood helper matching at LocalFelo.",
      path: "/faqs",
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqSchemaQuestions
      }
    });

    window.scrollTo({ top: 0 });
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "General", "Getting Help", "Earning Money", "Trust & Safety"];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "General": return <HelpCircle className="w-4 h-4 text-neutral-400 group-hover:text-[#F03220]" />;
      case "Getting Help": return <Sparkles className="w-4 h-4 text-neutral-400 group-hover:text-[#F03220]" />;
      case "Earning Money": return <CreditCard className="w-4 h-4 text-neutral-400 group-hover:text-[#F03220]" />;
      case "Trust & Safety": return <UserCheck className="w-4 h-4 text-neutral-400 group-hover:text-[#F03220]" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-20 text-left font-sans space-y-12"
      id="faqs-page-container"
    >
      {/* Search and Navigation crumbs */}
      <div className="flex flex-col gap-6 md:gap-8 pb-10 border-b border-white/[0.08]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 text-[#F03220]">
            <Shield className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span className="text-[10px] uppercase font-extrabold tracking-widest font-mono">
              SUPPORT CENTER
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            FAQs & Support Hub
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base font-normal max-w-2xl">
            Everything you need to know about requesting assistance, local safety standards, secure escrow models, and growing your personal income.
          </p>
        </div>

        {/* Dynamic Interactive Input Field box */}
        <div className="relative w-full max-w-lg mt-2" id="faq-search-box-wrapper">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-neutral-800 focus:border-[#F03220]/40 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#F03220]/20 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            id="faq-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid containing Sidebar categories and Accordion */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
        {/* Left Side Category Lists (Desktop sidebar / mobile scrollbar) */}
        <div className="md:col-span-4 space-y-2 md:sticky md:top-24 h-fit">
          <h3 className="hidden md:block text-xs font-bold uppercase tracking-widest text-[#F03220] font-mono mb-4">
            Browse Categories
          </h3>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-3 md:pb-0 scrollbar-none snap-x" id="faq-categories-tab">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveIndex(null);
                  }}
                  className={`group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap snap-start focus:outline-none ${
                    isActive
                      ? "bg-white/[0.04] border-neutral-700 text-white shadow-md shadow-black"
                      : "bg-[#111] border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F03220] hidden md:block" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side FAQs Accordion Items list */}
        <div className="md:col-span-8 space-y-3" id="faq-page-accordion">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const itemIdx = faqs.findIndex(f => f.question === faq.question);
              const isOpen = activeIndex === itemIdx;

              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-[#181818] border-neutral-800 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
                      : "bg-[#121212] border-neutral-900/60 hover:border-neutral-850"
                  }`}
                  id={`faq-accordion-item-${itemIdx}`}
                >
                  <button
                    onClick={() => setActiveIndex(isOpen ? null : itemIdx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-neutral-300 hover:text-white transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 leading-snug">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-600 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed border-t border-neutral-900">
                          <p>{faq.answer}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                              Category: {faq.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-[#121212] rounded-3xl border border-neutral-900/60 space-y-3">
              <p className="text-neutral-500 font-bold text-sm">No match found inside our Help topics.</p>
              <p className="text-neutral-600 text-xs">Try searching for simple words like "pay", "Aadhaar", "safety".</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-2 text-xs font-mono text-[#F03220] hover:underline font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support CTA section Card */}
      <div className="mt-16 bg-gradient-to-br from-neutral-900 to-[#121212] border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6" id="faq-direct-ticket-cta">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-base sm:text-lg font-extrabold text-white">
            Still have questions? We are here to talk.
          </h4>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Can't find what you need? Open a support ticket, and our local coordinators will assist you.
          </p>
        </div>
        <button
          onClick={() => onNavigate("/contact")}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F03220] hover:bg-white text-white hover:text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
        >
          <span>Contact Agents</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
