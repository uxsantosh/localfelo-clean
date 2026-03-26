import React from 'react';
import { Heart, ShoppingBag, Sparkles, Briefcase, MapPin, Mail, Lightbulb, FileText, Shield, Ban, Info, Users, Store } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

interface AppFooterProps {
  onNavigate: (section: string) => void;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export const AppFooter: React.FC<AppFooterProps> = ({ 
  onNavigate,
  socialLinks = {
    instagram: 'https://www.instagram.com/localfelo_india/',
    facebook: 'https://www.facebook.com/profile.php?id=61588207026321',
    linkedin: 'https://www.linkedin.com/company/localfelo/about/?viewAsMember=true',
    twitter: 'https://x.com/localfelo'
  }
}) => {
  return (
    <footer className="bg-white border-t-2 border-[#CDFF00] mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12">
          
          {/* Column 1: About LocalFelo */}
          <div className="md:pr-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoSvg} alt="LocalFelo" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              LocalFelo is a hyperlocal platform built to empower people across India by connecting individuals who need help with those who can offer it. From everyday tasks and local assistance to skilled services, mentorship, and community collaboration, LocalFelo enables people to support each other within their neighborhoods and cities.
              <br /><br />
              By making it easier for people to connect locally, LocalFelo aims to strengthen communities, create opportunities, and unlock the power of people helping people.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-4">
              {socialLinks?.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black p-2 hover:bg-gray-800 transition-colors" 
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 text-[#CDFF00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black p-2 hover:bg-gray-800 transition-colors" 
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 text-[#CDFF00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.linkedin && (
                <a 
                  href={socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black p-2 hover:bg-gray-800 transition-colors" 
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 text-[#CDFF00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black p-2 hover:bg-gray-800 transition-colors" 
                  aria-label="X (Twitter)"
                >
                  <svg className="w-4 h-4 text-[#CDFF00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-black border-b-2 border-[#CDFF00] pb-2 inline-block uppercase tracking-wide">
              Our Services
            </h3>
            <ul className="space-y-2.5 mt-4">
              <li>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Tasks & Gigs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wishes')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Wishes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('professionals')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Professionals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shops')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  Shops
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-black border-b-2 border-[#CDFF00] pb-2 inline-block uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-2.5 mt-4">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Safety */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-black border-b-2 border-[#CDFF00] pb-2 inline-block uppercase tracking-wide">
              Legal & Safety
            </h3>
            <ul className="space-y-2.5 mt-4">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('prohibited-items')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Prohibited Items
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#CDFF00] border-t border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-black font-medium">
              © {new Date().getFullYear()} LocalFelo. All rights reserved.
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/localfelo_india/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61588207026321" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/localfelo/about/?viewAsMember=true" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://x.com/localfelo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>for local communities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};