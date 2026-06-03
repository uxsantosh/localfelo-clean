import { motion } from "motion/react";
import { Shield, Lock, Eye, CheckCircle, ArrowLeft, Database, Users } from "lucide-react";

interface PrivacyPolicyProps {
  onNavigate: (path: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  const infoCollect = [
    { label: "Name", desc: "For user registration and basic identity recognition." },
    { label: "Phone number", desc: "For verification codes, direct transactional alerts, and account security." },
    { label: "Profile information", desc: "Custom listings, description summaries, and user ratings." },
    { label: "Selfie photograph & Aadhaar images", desc: "Collected solely for identification authenticity, fraud prevention, and building platform trust." },
    { label: "Location information", desc: "Coordinate signals to retrieve active independent tasks posted in your surrounding neighborhoods." },
    { label: "Task-related information", desc: "Independent task postings, message histories, and feedback ratings." }
  ];

  const infoUse = [
    { label: "Identity Verification", desc: "Assisting users in confirming peer identity authenticity to foster a safe network." },
    { label: "Fraud Prevention", desc: "Preventing duplicate registration, platform bypass, fake jobs, and unauthorized access." },
    { label: "Platform Safety & Security", desc: "Maintaining community guidelines, blocking bad actors, and administering platform integrity." },
    { label: "Account Management", desc: "Facilitating secure signup, preferences storage, and configuration options." },
    { label: "Transaction Facilitation", desc: "Exchanging necessary coordination parameters dynamically between connecting users." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-20 text-left space-y-12"
      id="privacy-policy-view"
    >


      {/* Header Info */}
      <div className="space-y-4 border-b border-white/[0.08] pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 text-[#F03220]">
          <Shield className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest font-mono">
            LEGAL STATEMENT
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-sans text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-neutral-400 text-sm font-medium font-mono">
          Last Updated: June 2026 • LocalFelo Trust and Safety Division
        </p>
      </div>

      {/* Main Sections */}
      <div className="space-y-10 text-neutral-300 font-medium text-sm sm:text-base leading-relaxed">
        
        {/* Section 1 */}
        <div className="space-y-4" id="section-info-collect">
          <div className="flex items-center gap-2.5 text-white">
            <Eye className="w-5 h-5 text-[#F03220]" />
            <h2 className="text-xl font-extrabold tracking-tight">Information We Collect</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            We collect and process a set of personal parameters to support a trusted matching interface. We do not sell or monetize your individual databases:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {infoCollect.map((item, id) => (
              <div key={id} className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 space-y-1">
                <span className="text-sm font-extrabold text-white block">{item.label}</span>
                <span className="text-xs text-neutral-400 block leading-normal">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Aadhaar Verification Note */}
        <div className="p-6 rounded-3xl bg-[#F03220]/5 border border-[#F03220]/15 space-y-2" id="verification-disclaimer">
          <h3 className="text-xs font-mono font-black text-[#F03220] uppercase tracking-widest">Verification Protocol Note</h3>
          <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
            Selfie photographs and Aadhaar images are collected solely for verification and trust purposes. These documents are encrypted, handled through secure identity nodes, and checked strictly to maintain neighborhood reliability and platform safety.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4" id="section-info-use">
          <div className="flex items-center gap-2.5 text-white">
            <CheckCircle className="w-5 h-5 text-[#F03220]" />
            <h2 className="text-xl font-extrabold tracking-tight">How We Use Information</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Any collected information is utilized strictly to provide safety, security, and administrative facilitation on our technology platform:
          </p>
          <ul className="space-y-3 pl-1">
            {infoUse.map((item, id) => (
              <li key={id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F03220] mt-2 shrink-0" />
                <div>
                  <strong className="text-white font-bold">{item.label}:</strong>{" "}
                  <span className="text-neutral-400">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Data Retention */}
        <div className="space-y-4" id="section-data-retention">
          <div className="flex items-center gap-2.5 text-white">
            <Database className="w-5 h-5 text-[#F03220]" />
            <h2 className="text-xl font-extrabold tracking-tight">Data Retention</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            We store your personal verification papers, coordinates, and historical task records only as reasonably necessary to satisfy legal mandates, platform security, active fraud prevention algorithms, and operational compliance objectives. You may submit requests to cease processing or delete records at any time where applicable.
          </p>
        </div>

        {/* Section 4: Third-Party Providers */}
        <div className="space-y-4" id="section-third-party">
          <div className="flex items-center gap-2.5 text-white">
            <Users className="w-5 h-5 text-[#F03220]" />
            <h2 className="text-xl font-extrabold tracking-tight">Third-Party Providers</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            To provide a fully integrated, low-latency matching service, certain functional modules may be outsourced securely to third-party enterprise providers, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400 font-semibold">
            <li><strong className="text-white">Payment Processors:</strong> Gateways managing wallet top-ups, payouts, and transaction escrow securely (such as Razorpay).</li>
            <li><strong className="text-white">Communication Services:</strong> Infrastructure networks handling SMS authentication triggers and localized peer-to-peer chats.</li>
            <li><strong className="text-white">Analytics Providers:</strong> Performance auditing scripts to resolve app latencies, design berrors, or location query failures.</li>
            <li><strong className="text-white">Infrastructure Providers:</strong> Sandboxed hosting and database clouds running our technology operations.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/5 space-y-3" id="section-data-security">
          <div className="flex items-center gap-2.5 text-white">
            <Lock className="w-5 h-5 text-[#F03220]" />
            <h3 className="text-lg font-extrabold text-white font-sans tracking-tight">Data Security</h3>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            We incorporate classic, industry-accepted data security standards, including database encryption at rest, secure socket transport channels (HTTPS), and authorization checks inside our microservices to prevent leaks.
          </p>
        </div>

        {/* Section 6 */}
        <div className="pt-6 border-t border-white/[0.08]" id="section-privacy-contact">
          <h3 className="text-lg font-extrabold text-white font-sans tracking-tight">Privacy Inquiries</h3>
          <p className="text-neutral-400 text-sm mt-1">
            For specific privacy concerns, coordinate erasure queries, or verification details:{" "}
            <a href="mailto:support@localfelo.com" className="text-[#F03220] font-extrabold hover:underline">
              support@localfelo.com
            </a>
          </p>
        </div>

      </div>
    </motion.div>
  );
}

