import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LifeBuoy, Mail, ArrowLeft, ChevronDown, 
  UserCheck, CreditCard, ClipboardList, ShieldAlert, CheckCircle, AlertTriangle
} from "lucide-react";

interface SupportCenterProps {
  onNavigate: (path: string) => void;
}

export default function SupportCenter({ onNavigate }: SupportCenterProps) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const topics = [
    {
      icon: UserCheck,
      title: "Account Management",
      color: "text-[#F03220]",
      bgClass: "bg-[#F03220]/5 border-[#F03220]/10",
      desc: "Recover locked helper or poster profiles, adjust localized coordinate centers, or manage security configurations."
    },
    {
      icon: ShieldAlert,
      title: "Identity Verification Support",
      color: "text-[#F03220]",
      bgClass: "bg-[#F03220]/5 border-[#F03220]/10",
      desc: "Obtain guidance regarding selfie matching updates, resolving Aadhaar encryption upload holds, or clarifying trust badges."
    },
    {
      icon: ClipboardList,
      title: "Platform Navigation",
      color: "text-[#F03220]",
      bgClass: "bg-[#F03220]/5 border-[#F03220]/10",
      desc: "Learn how to publish spatial task flyers, navigate localized search feeds, place peer bids, or write feedback scores."
    },
    {
      icon: CreditCard,
      title: "Payment Platform Issues",
      color: "text-[#F03220]",
      bgClass: "bg-[#F03220]/5 border-[#F03220]/10",
      desc: "Clarify secure transactional delays, handle authorized gateway partner inquiries, or verify wallet displays."
    }
  ];

  const supportLimitations = {
    canHelp: [
      "Clarifying of platform navigation & usage instructions",
      "Investigating technical identity verification status errors",
      "Resetting account locks or password security parameters",
      "Reviewing system-side wallet transfers or gateway receipts"
    ],
    cannotHelp: [
      "Securing or guaranteeing work completion or helper arrival",
      "Enforcing or negotiating chore adjustments, rates, or scope",
      "Polishing, supervising, or inspecting executed user-to-user work",
      "Authoritatively settling private contract disagreements or user interactions"
    ]
  };

  const helperFaqs = [
    {
      q: "Can LocalFelo support force a helper to return or refund money?",
      a: "No. LocalFelo acts only as a technology matching intermediary. Any agreement, timeline, or pricing for a chore exists directly and privately between users. Our platform support crew can guide you on app features but cannot legally enforce refunds or supervise private covenants."
    },
    {
      q: "How are payment issues through Razorpay handled?",
      a: "We integrate with secure, accredited third-party payment gateways like Razorpay. If your wallet settlement is halted or fails on checkout, our crew can audit platform-level APIs to ensure our connection with the partner node is operational."
    },
    {
      q: "How does identity verification support work?",
      a: "If your verification upload fails, our safety crew will inspect the submission to ensure matches meet legibility standards. Aadhaar and selfie checks are strictly used to protect community authenticity and safety on the platform."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-28 relative z-20 text-left space-y-12"
      id="support-center-view"
    >


      {/* Header Info */}
      <div className="space-y-4 border-b border-white/[0.08] pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 text-[#F03220]">
          <LifeBuoy className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest font-mono">
            SUPPORT HUB ACTIVE
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-sans text-white tracking-tight">
          Support Center
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-xl">
          Need Help? We're dedicated to helping you master the platform. Read through our capabilities below.
        </p>
      </div>

      {/* Core Scope Policy Boundary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="support-scope-boundaries-grid">
        <div className="p-6 rounded-3xl bg-emerald-950/10 border border-emerald-500/10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <h3 className="text-sm font-extrabold tracking-tight font-sans uppercase">What we can assist with</h3>
          </div>
          <ul className="space-y-2.5">
            {supportLimitations.canHelp.map((item, id) => (
              <li key={id} className="flex items-start gap-2.5 text-xs text-neutral-400 leading-normal">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-red-950/15 border border-red-500/10 space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-extrabold tracking-tight font-sans uppercase">What we cannot assist with</h3>
          </div>
          <ul className="space-y-2.5">
            {supportLimitations.cannotHelp.map((item, id) => (
              <li key={id} className="flex items-start gap-2.5 text-xs text-neutral-400 leading-normal">
                <span className="text-red-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Direct Info Section */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 space-y-2 text-xs text-neutral-400">
        <strong className="text-white block">DISPUTES & ENFORCEABILITY LIMITATION</strong>
        Since agreements regarding chores, timelines, and outcomes occur exclusively between the independent Poster and Helper directly, <strong className="text-white">LocalFelo cannot guarantee resolution of or enforce settlements for private disputes arising from these agreements.</strong> We encourage safe, thoughtful communications to reach collaborative conclusions.
      </div>

      {/* Topics Grid */}
      <div className="space-y-6">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#F03220] font-mono">
          COMMON SUPPORT TOPICS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="support-topics-grid">
          {topics.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div 
                key={idx}
                className={`p-6 rounded-3xl bg-neutral-900/40 border border-white/5 space-y-3 transition-colors ${t.bgClass}`}
                id={`support-topic-card-${idx}`}
              >
                <div className={`p-2.5 rounded-xl bg-black/50 border border-white/10 inline-flex items-center justify-center ${t.color}`}>
                  <Icon className="w-5 h-5 stroke-[2px]" />
                </div>
                <h4 className="text-base font-extrabold text-white tracking-tight">
                  {t.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Accordion Mini info */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]" id="support-helper-faqs">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 font-mono mb-2">
          SUPPORT FAQS
        </h3>

        {helperFaqs.map((item, id) => {
          const isOpen = activeFAQ === id;
          return (
            <div 
              key={id}
              className="border border-white/5 rounded-2xl bg-neutral-900/30 overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left text-sm font-bold text-neutral-200"
                onClick={() => setActiveFAQ(isOpen ? null : id)}
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#F03220]" : "text-neutral-500"}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="p-4 pt-0 border-t border-white/[0.04] text-xs leading-relaxed text-neutral-400 font-medium">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Support Direct Contacts */}
      <div className="p-8 rounded-3xl bg-neutral-900/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6" id="support-direct-cta">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3.5 rounded-2xl bg-[#F03220]/15 text-[#F03220] border border-[#F03220]/25">
            <Mail className="w-6 h-6 stroke-[2px]" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest font-mono">
              DIRECT ASSISTANCE
            </span>
            <h4 className="text-sm font-extrabold text-white">support@localfelo.com</h4>
            <span className="text-[11px] text-neutral-400 font-bold block mt-0.5">Response SLA: Usually within 24 hours</span>
          </div>
        </div>
        <a 
          href="mailto:support@localfelo.com"
          className="px-6 py-3 rounded-2xl bg-[#F03220] text-white text-xs font-extrabold hover:bg-neutral-800 border border-[#F03220]/20 hover:border-white/15 transition-all w-full sm:w-auto text-center"
        >
          Send Email
        </a>
      </div>

    </motion.div>
  );
}

