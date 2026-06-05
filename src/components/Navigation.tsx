import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Menu, X, Smartphone } from "lucide-react";
import Logo from "./Logo";

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string, hash?: string) => void;
}

export default function Navigation({ currentPath, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { name: string; path?: string; hash?: string }[] = [
    { name: "FAQs", path: "/faqs" },
    { name: "Contact Us", path: "/contact" }
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0D0D0D]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-b border-transparent" 
          : "bg-transparent border-b border-transparent"
      }`} 
      id="site-header"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between" id="nav-container">
        {/* Brand Logo Link with nice interactive hover glow */}
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/");
          }} 
          className="flex items-center gap-2 text-white hover:text-[#F03220] transition-colors focus:outline-none cursor-pointer"
          id="nav-logo-link"
        >
          <Logo className="w-32 md:w-36 text-white" />
        </a>

        {/* Desktop Links - Right Aligned & Sleek */}
        <nav className="hidden md:flex items-center gap-8" id="desktop-nav-menu">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path ? link.path : `/${link.hash}`}
              onClick={(e) => {
                e.preventDefault();
                if (link.path) {
                  onNavigate(link.path);
                } else {
                  onNavigate("/", link.hash);
                }
              }}
              className="relative text-[11px] uppercase tracking-widest text-[#9c9c9c] font-bold hover:text-white transition-colors duration-200 group py-1.5 focus:outline-none cursor-pointer"
            >
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#F03220] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Mobile menu response block */}
        <div className="md:hidden flex items-center" id="mobile-menu-trigger-container">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg overflow-hidden relative focus:outline-none"
            id="mobile-menu-button"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu with Framer Motion Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0D0D0D] border-b border-white/[0.08] overflow-hidden"
            id="mobile-drawer-menu"
          >
            <div className="px-6 pt-2 pb-6 space-y-4 flex flex-col items-start">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path ? link.path : `/${link.hash}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    if (link.path) {
                      onNavigate(link.path);
                    } else {
                      onNavigate("/", link.hash);
                    }
                  }}
                  className="w-full text-left text-base text-neutral-400 hover:text-white font-medium transition-colors py-2 border-b border-white/[0.04] focus:outline-none cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/#download"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  onNavigate("/", "#download");
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#F03220] hover:bg-neutral-800 text-white font-extrabold text-sm shadow-lg transition-colors mt-2 cursor-pointer"
                id="mobile-drawer-download-btn"
              >
                <Smartphone className="w-4 h-4" />
                <span>Download App</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
