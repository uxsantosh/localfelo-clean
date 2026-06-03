import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Briefcase, Shield, Copy, Check, ArrowUpRight, ArrowLeft } from "lucide-react";

interface ContactUsProps {
  onNavigate: (path: string) => void;
}

export default function ContactUs({ onNavigate }: ContactUsProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  const addressSpecs = [
    {
      title: "Support Contact",
      description: "Get technical help with platform usage, account creation, registration verification inquiries, or payment gateway queries.",
      email: "support@localfelo.com",
      icon: Mail,
      tag: "Support",
      accent: "rgba(240, 50, 32, 0.15)"
    },
    {
      title: "Business Partnerships",
      description: "Enquire about geographic scaling trials, corporate licenses, localized sponsorship opportunities, or joint marketing efforts.",
      email: "partners@localfelo.com",
      icon: Briefcase,
      tag: "Business",
      accent: "rgba(240, 50, 32, 0.15)"
    },
    {
      title: "Privacy Contact",
      description: "Contact us regarding your personal registration parameters, coordinate deletion requests, or our general privacy operations.",
      email: "support@localfelo.com",
      icon: Shield,
      tag: "Privacy",
      accent: "rgba(240, 50, 32, 0.2)"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-24 relative z-20 text-left space-y-16"
      id="contact-us-view"
    >
      {/* Background ambient glows specialized for this view */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(240,50,32,0.06)_0%,transparent_75%)] blur-[120px] pointer-events-none -z-10" />



      {/* Header Info */}
      <div className="space-y-4 border-b border-white/[0.08] pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 text-[#F03220]">
          <Mail className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest font-mono">
            CONNECT DIRECTLY
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black font-sans text-white tracking-tight leading-none">
          Contact our <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#F03220]">Crew</span>
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
          Skip the forms. Reach us directly at these dedicated email channels below. We strive to reply within 24 hours.
        </p>
      </div>

      {/* Grid: Direct Bento Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="contact-channels-grid">
        {addressSpecs.map((chn, idx) => {
          const Icon = chn.icon;
          const isCopied = copiedEmail === chn.email;
          return (
            <motion.div
              layout
              key={idx}
              whileHover={{ y: -6, borderColor: "rgba(240, 50, 32, 0.35)" }}
              transition={{ duration: 0.2 }}
              className="relative p-8 rounded-3xl bg-[#090909] border border-neutral-900 group flex flex-col justify-between gap-8 h-full overflow-hidden transition-colors"
              id={`contact-bento-card-${idx}`}
            >
              {/* Radial subtle ambient backplane glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 10% 10%, ${chn.accent} 0%, transparent 70%)`
                }}
              />

              {/* Card Header row */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-900 text-neutral-400 group-hover:text-[#F03220] group-hover:border-[#F03220]/20 shadow-[0_0_15px_rgba(240,50,32,0.05)] transition-all duration-300">
                    <Icon className="w-5 h-5 stroke-[1.5px]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded-full bg-[#F03220]/5 text-[#F03220]/80 border border-[#F03220]/10 tracking-widest">
                    {chn.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#F03220]/90 transition-colors">
                    {chn.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {chn.description}
                  </p>
                </div>
              </div>

              {/* Email actionable interaction bar */}
              <div className="relative z-10 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id={`contact-bento-card-actions-${idx}`}>
                <a
                  href={`mailto:${chn.email}`}
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#F03220] transition-colors group/link break-all"
                >
                  <span className="text-sm font-extrabold tracking-tight font-sans">
                    {chn.email}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover/link:text-[#F03220] transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>

                {/* Instant copy button */}
                <button
                  onClick={() => copyToClipboard(chn.email)}
                  className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border font-mono font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer select-none ${
                    isCopied
                      ? "bg-[#F03220] text-white border-[#F03220]"
                      : "bg-black/50 text-neutral-400 border-neutral-900 hover:text-white hover:border-neutral-800"
                  }`}
                  aria-label={`Copy ${chn.email} address`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[2.5px]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Accent right bottom indicator */}
              <div className="absolute top-4 right-4 w-1 h-1 rounded-full bg-neutral-800 group-hover:bg-[#F03220] transition-colors" />
            </motion.div>
          );
        })}
      </div>

      {/* Factual Disclaimer Banner */}
      <div className="p-8 rounded-3xl bg-neutral-900/20 border border-white/[0.04] relative overflow-hidden text-neutral-400 text-xs leading-normal">
        <p className="font-semibold text-neutral-300 mb-1 font-sans uppercase text-[10px] tracking-widest text-[#F03220]">Intermediary Contact Notice</p>
        Please note that LocalFelo contact channels are provided strictly for technology platform assistance (including user accounts, app bugs, verification holds, and gateway APIs). True to our status as an intermediary technology framework, LocalFelo cannot guarantee execution of private agreements, inspect user-to-user chore results, or offer legal promises, arbitration guarantees, or service warranties regarding independent matching interactions.
      </div>

    </motion.div>
  );
}

