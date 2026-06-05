import { Mail, Briefcase, Clock, Send } from "lucide-react";

export default function NeedHelp() {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email Support",
      value: "support@localfelo.com",
      color: "text-rose-500",
      bgClass: "bg-rose-500/5 border-rose-500/10",
      link: "mailto:support@localfelo.com"
    },
    {
      icon: Briefcase,
      label: "Business Enquiries",
      value: "partners@localfelo.com",
      color: "text-amber-500",
      bgClass: "bg-amber-500/5 border-amber-500/10",
      link: "mailto:partners@localfelo.com"
    },
    {
      icon: Clock,
      label: "Response Time",
      value: "Typically within 24 hours",
      color: "text-emerald-500",
      bgClass: "bg-emerald-500/5 border-emerald-500/10",
      link: null
    }
  ];

  return (
    <section 
      id="contact-support" 
      className="w-full py-20 border-t border-white/[0.08] bg-[#0D0D0D]/40 relative z-20"
    >
      <div className="max-w-5xl mx-auto px-6 space-y-12 text-center">
        
        {/* Support Heading */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-white/5 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F03220]">
              CONTACT SUPPORT
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            We're here to help
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            Have questions, feedback, or need support? Our team is here to assist.
          </p>
        </div>

        {/* Contact info cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" id="contact-info-cards-grid">
          {contactInfo.map((card, idx) => {
            const Icon = card.icon;
            const content = (
              <div 
                className={`p-6 rounded-3xl bg-[#161616]/40 border border-white/5 text-center flex flex-col items-center gap-4 transition-all duration-300 hover:border-white/10 ${card.bgClass}`}
                id={`contact-card-${idx}`}
              >
                <div className={`p-3 rounded-2xl bg-[#0D0D0D]/50 border border-white/10 ${card.color}`}>
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 font-extrabold uppercase tracking-widest block font-mono">
                    {card.label}
                  </span>
                  <span className="text-sm font-extrabold text-white mt-1 block">
                    {card.value}
                  </span>
                </div>
              </div>
            );

            return card.link ? (
              <a href={card.link} key={idx} className="block group focus:outline-none">
                {content}
              </a>
            ) : (
              <div key={idx} className="block">
                {content}
              </div>
            );
          })}
        </div>

        {/* Support Mail CTA Button */}
        <div className="pt-4">
          <a 
            href="mailto:support@localfelo.com"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#0D0D0D] font-extrabold text-sm hover:bg-neutral-150 shadow-2xl transition-all duration-300"
          >
            <span>Contact Support</span>
            <Send className="w-4 h-4 stroke-[2.5px]" />
          </a>
        </div>

      </div>
    </section>
  );
}
