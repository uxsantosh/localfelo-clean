import React from 'react';
import { FileText, Shield, AlertTriangle, Ban, Mail, Smartphone } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: string) => void;
  onContactClick?: () => void;
  appDownloadUrl?: string;
  appDownloadEnabled?: boolean;
}

export function Footer({ onNavigate, onContactClick, appDownloadUrl, appDownloadEnabled }: FooterProps) {
  const policyLinks = [
    { screen: 'safety', label: 'Safety & Community Guidelines', icon: Shield },
    { screen: 'terms', label: 'Terms & Conditions', icon: FileText },
    { screen: 'privacy', label: 'Privacy Policy', icon: Shield },
    { screen: 'prohibited', label: 'Prohibited Items', icon: Ban },
  ];

  const handleAppDownload = () => {
    if (appDownloadUrl) {
      window.open(appDownloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-3 sm:py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {policyLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.screen}
                onClick={() => onNavigate(link.screen)}
                className="flex items-center gap-2 text-sm text-body hover:text-primary transition-colors text-left"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted">
            <div className="flex items-center gap-4">
              <p>© 2024 LocalFelo. All rights reserved.</p>
              <button
                onClick={onContactClick}
                className="flex items-center gap-1.5 text-body hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </button>
              {appDownloadEnabled && appDownloadUrl && (
                <button
                  onClick={handleAppDownload}
                  className="flex items-center gap-1.5 text-body hover:text-primary transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Download App</span>
                </button>
              )}
            </div>
            <p className="text-xs">Connector platform - Payments handled between users</p>
          </div>
        </div>
      </div>
    </footer>
  );
}