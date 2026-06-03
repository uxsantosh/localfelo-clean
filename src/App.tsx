import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import BackgroundGlow from "./components/BackgroundGlow";
import Navigation from "./components/Navigation";
import PhoneMockup from "./components/PhoneMockup";
import DownloadButtons from "./components/DownloadButtons";
import ScanQR from "./components/ScanQR";
import FloatingBanners from "./components/FloatingBanners";
import HowToGetHelp from "./components/HowToGetHelp";
import HowToEarnMoney from "./components/HowToEarnMoney";
import WhyTrustUs from "./components/WhyTrustUs";
import FAQs from "./components/FAQs";
import DownloadCTA from "./components/DownloadCTA";
import SEOContent from "./components/SEOContent";

// Dynamic Sub-Page Imports
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsConditions from "./components/TermsConditions";
import SupportCenter from "./components/SupportCenter";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import PointerRadar from "./components/PointerRadar";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Synchronize browser history and Document title
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      
      if (path === "/privacy-policy") {
        document.title = "Privacy Policy | LocalFelo";
      } else if (path === "/terms-and-conditions") {
        document.title = "Terms & Conditions | LocalFelo";
      } else if (path === "/support") {
        document.title = "Support Center | LocalFelo";
      } else if (path === "/contact") {
        document.title = "Contact Us | LocalFelo";
      } else {
        document.title = "LocalFelo - Get Help Nearby or Earn by Helping Others";
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (path: string, hash?: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);

    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Set page title
    if (path === "/privacy-policy") {
      document.title = "Privacy Policy | LocalFelo";
    } else if (path === "/terms-and-conditions") {
      document.title = "Terms & Conditions | LocalFelo";
    } else if (path === "/support") {
      document.title = "Support Center | LocalFelo";
    } else if (path === "/contact") {
      document.title = "Contact Us | LocalFelo";
    } else {
      document.title = "LocalFelo - Get Help Nearby or Earn by Helping Others";
    }
  };

  // Simple scroll hint handler to scroll down gently
  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: "smooth"
    });
    setHasScrolled(true);
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-[#F03220]/30 selection:text-[#fff]" id="localfelo-landing-app">
      
      {/* Dynamic Physical Location Radar Pointer animation */}
      <PointerRadar />
      
      {/* Living breathing dark cinematic ambient gradient background */}
      <BackgroundGlow />

      {/* Modern, high-end top navigation bar */}
      <Navigation currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Primary content area rendering with state transitions */}
      {currentPath === "/" ? (
        <>
          <div className="relative w-full overflow-hidden">
            {/* Moving person symbols and banners waving and floating in loop across full viewport width */}
            <FloatingBanners />

            {/* Main Hero Container */}
            <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-6 md:pt-4 md:pb-8 flex flex-col items-center text-center z-10" id="hero-main-content">
            
            {/* Headline Header */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white max-w-3xl leading-[1.1] mb-3"
              id="hero-headline"
            >
              Get help nearby.<br />Or help someone <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500 font-extrabold">and earn.</span>
            </motion.h1>

            {/* Subheadline Details */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-xs sm:text-sm md:text-base text-neutral-400 font-medium max-w-xl leading-relaxed mb-4"
              id="hero-subheadline"
            >
              LocalFelo connects people who need help with people ready to help - all within your local community.
            </motion.p>

            {/* Main FLOATING device mockup spotlight center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full max-w-[280px] sm:max-w-[310px] mx-auto my-2 md:my-4 relative z-20"
              id="hero-mockup-section"
            >
              {/* Main phone showcase */}
              <PhoneMockup />
            </motion.div>

            {/* Primary Download Badges - Placed below the mockup */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="w-full relative z-20 mt-4 mb-2"
              id="hero-download-buttons-wrapper"
            >
              <DownloadButtons />
            </motion.div>

            {/* Scan QR Section */}
            <ScanQR />

            {/* Subtle Scroll Indicator at the bottom of hero section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ delay: 0.8, duration: 3, repeat: Infinity, ease: "easeInOut" }}
              onClick={handleScrollClick}
              className="cursor-pointer group flex flex-col items-center gap-1.5 pt-4 transition-all duration-300 hover:text-white"
              id="scroll-hint-container"
            >
              <span className="text-xs font-bold text-neutral-600 group-hover:text-white tracking-widest uppercase">
                Scroll to discover
              </span>
              <motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-12 rounded-full border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center pt-1"
              >
                <ArrowDown className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white" />
              </motion.div>
            </motion.div>

          </main>
        </div>

          {/* SECTION 1 - How to Get Help Visual Timeline */}
          <HowToGetHelp />

          {/* SECTION 2 - How to Earn Money Visual Timeline */}
          <HowToEarnMoney />

          {/* SECTION 3 - Why People Trust LocalFelo */}
          <WhyTrustUs />

          {/* SECTION 4 - FAQs */}
          <FAQs />

          {/* SECTION 5 - Download App CTA */}
          <DownloadCTA />

          {/* Bottom Indexable Directory Map Accent */}
          <SEOContent />
        </>
      ) : currentPath === "/privacy-policy" ? (
        <PrivacyPolicy onNavigate={handleNavigate} />
      ) : currentPath === "/terms-and-conditions" ? (
        <TermsConditions onNavigate={handleNavigate} />
      ) : currentPath === "/support" ? (
        <SupportCenter onNavigate={handleNavigate} />
      ) : currentPath === "/contact" ? (
        <ContactUs onNavigate={handleNavigate} />
      ) : (
        <div className="max-w-md mx-auto py-32 px-6 text-center space-y-6" id="not-found-view">
          <h1 className="text-6xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-600">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-neutral-500 text-sm">The neighborhood lane you are looking for does not exist on our map.</p>
          <button 
            onClick={() => handleNavigate("/")} 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 border border-neutral-700 text-xs font-bold text-white shadow-lg cursor-pointer"
          >
            Back to Safety
          </button>
        </div>
      )}

      {/* Website Footer (PART A) - Rendered across all views with navigation handling */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
