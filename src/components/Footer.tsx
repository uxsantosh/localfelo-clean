import Logo from "./Logo";

interface FooterProps {
  onNavigate: (path: string, hash?: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const productLinks = [
    { name: "FAQs", path: "/faqs" },
    { name: "Download App", hash: "#download" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms & Conditions", path: "/terms-and-conditions" }
  ];

  const supportLinks = [
    { name: "Support Center", path: "/support" },
    { name: "Contact Us", path: "/contact" }
  ];

  return (
    <footer 
      id="site-footer" 
      className="w-full bg-[#0D0D0D] border-t border-white/[0.08] pt-16 pb-8 relative z-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/[0.04]">
        
        {/* Column 1: Brand details card */}
        <div className="lg:col-span-4 text-center md:text-left flex flex-col items-center md:items-start space-y-4">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("/");
            }} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <Logo className="w-36 text-white" />
          </a>
          
          <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-xs pt-1 text-center md:text-left">
            Helping people get things done and earn locally. The decentralized, trusted helper ecosystem for every community.
          </p>
        </div>

        {/* Column 2: Product links */}
        <div className="lg:col-span-2 text-center md:text-left lg:text-right flex flex-col items-center md:items-start lg:items-end space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#F03220] font-mono">
            Product
          </h4>
          <ul className="space-y-2.5 flex flex-col items-center md:items-start lg:text-right">
            {productLinks.map((lnk) => (
              <li key={lnk.name}>
                <a
                  href={lnk.path ? lnk.path : `/${lnk.hash}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (lnk.path) {
                      onNavigate(lnk.path);
                    } else {
                      onNavigate("/", lnk.hash);
                    }
                  }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none text-center md:text-left lg:text-right font-medium cursor-pointer"
                >
                  {lnk.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Legal links */}
        <div className="lg:col-span-3 text-center md:text-left lg:text-right flex flex-col items-center md:items-start lg:items-end space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 font-mono">
            Legal
          </h4>
          <ul className="space-y-2.5 flex flex-col items-center md:items-start lg:items-end">
            {legalLinks.map((lnk) => (
              <li key={lnk.name}>
                <a
                  href={lnk.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(lnk.path);
                  }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none text-center md:text-left lg:text-right font-medium cursor-pointer"
                >
                  {lnk.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Support & Contacts links */}
        <div className="lg:col-span-3 text-center md:text-left lg:text-right flex flex-col items-center md:items-start lg:items-end space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 font-mono">
            Support
          </h4>
          <ul className="space-y-2.5 flex flex-col items-center md:items-start lg:items-end">
            {supportLinks.map((lnk) => (
              <li key={lnk.name}>
                <a
                  href={lnk.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(lnk.path);
                  }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors focus:outline-none text-center md:text-left lg:text-right font-medium cursor-pointer"
                >
                  {lnk.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom copyright row info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
        <span className="text-center sm:text-left">© 2026 LocalFelo. All rights reserved. - Connecting neighbors for local growth</span>
        <span className="flex items-center justify-center sm:justify-end gap-1.5 text-center sm:text-right">
          Created in India to empower local community helpers <span className="text-sm select-none" role="img" aria-label="India flag">🇮🇳</span>
        </span>
      </div>
    </footer>
  );
}
