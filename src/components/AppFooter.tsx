import React from 'react';
import { Heart, ShoppingBag, Sparkles, Briefcase, MapPin, Instagram, Facebook, Linkedin, Mail, Lightbulb, FileText, Shield, Ban, Info } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

interface AppFooterProps {
  onNavigate: (screen: string) => void;
  onContactClick: () => void;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export function AppFooter({ onNavigate, onContactClick, socialLinks }: AppFooterProps) {
  return (
    <footer className="hidden md:block bg-white border-t-4 border-[#CDFF00] mt-12 w-full">
      {/* How It Works Section with Animation */}
      <div className="relative bg-gradient-to-br from-[#CDFF00] via-[#CDFF00] to-[#b8e600] py-12 overflow-hidden">
        {/* Animated Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '3.5s' }}></div>
          
          {/* Sparkle Stars */}
          <Sparkles className="absolute top-16 left-1/3 w-5 h-5 text-white opacity-60 animate-pulse" style={{ animationDuration: '2s' }} />
          <Sparkles className="absolute bottom-16 right-1/4 w-4 h-4 text-white opacity-50 animate-ping" style={{ animationDuration: '3s' }} />
          <Sparkles className="absolute top-1/2 left-20 w-3 h-3 text-white opacity-40 animate-pulse" style={{ animationDuration: '2.8s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-2xl font-bold text-black mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tasks */}
            <div className="flex items-start gap-4">
              <div className="bg-black p-3 shadow-lg shadow-black/20">
                <Briefcase className="w-6 h-6 text-[#CDFF00]" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Tasks</h3>
                <p className="text-sm text-black">Post tasks at your convenient price. Local helpers can view and accept to help you. They earn, you get work done easily.</p>
              </div>
            </div>

            {/* Wishes */}
            <div className="flex items-start gap-4">
              <div className="bg-black p-3 shadow-lg shadow-black/20">
                <Sparkles className="w-6 h-6 text-[#CDFF00]" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Wishes</h3>
                <p className="text-sm text-black">Wish for anything you need. People nearby can view your wish and contact you directly to fulfill it.</p>
              </div>
            </div>

            {/* Buy&Sell */}
            <div className="flex items-start gap-4">
              <div className="bg-black p-3 shadow-lg shadow-black/20">
                <ShoppingBag className="w-6 h-6 text-[#CDFF00]" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Buy&Sell</h3>
                <p className="text-sm text-black">Sell unlimited things at no cost. Find local ads, buy anything, and connect with buyers or sellers near you.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ending Banner - Moved Before Links Section */}
      <div className="relative bg-gradient-to-r from-black via-gray-900 to-black py-10 overflow-hidden">
        {/* Animated Background Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-5 left-10 w-2 h-2 bg-[#CDFF00] rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute top-10 right-16 w-1.5 h-1.5 bg-[#CDFF00] rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-8 left-1/4 w-1 h-1 bg-[#CDFF00] rounded-full animate-ping" style={{ animationDuration: '3.5s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#CDFF00] rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute bottom-5 right-20 w-1.5 h-1.5 bg-[#CDFF00] rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          
          {/* Sparkle Stars */}
          
          <Sparkles className="absolute bottom-8 right-1/4 w-5 h-5 text-[#CDFF00] opacity-50 animate-ping" style={{ animationDuration: '3.2s' }} />
          <Sparkles className="absolute top-1/2 left-16 w-4 h-4 text-[#CDFF00] opacity-40 animate-pulse" style={{ animationDuration: '2.8s' }} />
          <Sparkles className="absolute top-12 right-1/2 w-5 h-5 text-white opacity-30 animate-ping" style={{ animationDuration: '3.8s' }} />
        </div>

        {/* Glowing Border Effect */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#CDFF00] to-transparent animate-pulse"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#CDFF00] to-transparent animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-2">
            <p className="text-[#CDFF00] font-bold text-2xl bg-gradient-to-r from-[#CDFF00] via-white to-[#CDFF00] bg-clip-text text-transparent">
              India's First Wish-Based Hyperlocal Platform
            </p>
          </div>
          <p className="text-white text-base font-medium">Connecting local communities for tasks, wishes, and marketplace</p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-2">
            <img 
              src={logoSvg} 
              alt="LocalFelo - India's Hyperlocal Marketplace Platform" 
              className="h-10 mb-4" 
            />
            <h2 className="text-lg font-bold text-black mb-3">Empowering People Through Local Connections</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
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
                  <Instagram className="w-4 h-4 text-[#CDFF00]" />
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
                  <Facebook className="w-4 h-4 text-[#CDFF00]" />
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
                  <Linkedin className="w-4 h-4 text-[#CDFF00]" />
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
            </ul>
          </div>

          {/* Column 3: Legal & Company */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-black border-b-2 border-[#CDFF00] pb-2 inline-block uppercase tracking-wide">
              Company & Legal
            </h3>
            <ul className="space-y-2.5 mt-4">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  About LocalFelo
                </button>
              </li>
              <li>
                <button
                  onClick={onContactClick}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Us
                </button>
              </li>
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
                  onClick={() => onNavigate('prohibited')}
                  className="text-sm text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Prohibited Items
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} LocalFelo. All rights reserved. | India's Trusted Hyperlocal Community Platform
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/localfelo_india/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61588207026321" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/localfelo/about/?viewAsMember=true" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
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
}