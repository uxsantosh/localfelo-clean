import React from 'react';
import { Header } from '../components/Header';
import { Mail, Instagram, Facebook, Linkedin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ContactPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function ContactPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: ContactPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Contact Us" 
        showBack 
        onBack={onBack}
        currentScreen="contact"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1553775282-20af80779df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cHBvcnQlMjBjb250YWN0fGVufDF8fHx8MTc2NDQ1ODk3N3ww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Contact Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">Contact Us</h1>
            <p className="text-white/90 text-sm lg:text-base">We're here to help</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-6">
          <div>
            <h2 className="text-heading mb-2">Get in Touch</h2>
            <p className="text-body">
              Have questions, feedback, or need help? We'd love to hear from you!
            </p>
          </div>

          {/* Email */}
          <a
            href="mailto:contact@localfelo.com"
            className="card flex items-center gap-4 hover:bg-background transition-all no-underline"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-black" />
            </div>
            <div>
              <h4 className="text-heading m-0 mb-1">Email</h4>
              <p className="text-body text-sm m-0">contact@localfelo.com</p>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/localfelo"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 hover:bg-background transition-all no-underline"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Instagram className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-heading m-0 mb-1">Instagram</h4>
              <p className="text-body text-sm m-0">@localfelo</p>
            </div>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/localfelo"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 hover:bg-background transition-all no-underline"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Facebook className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-heading m-0 mb-1">Facebook</h4>
              <p className="text-body text-sm m-0">@localfelo</p>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/localfelo"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 hover:bg-background transition-all no-underline"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Linkedin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-heading m-0 mb-1">LinkedIn</h4>
              <p className="text-body text-sm m-0">LocalFelo</p>
            </div>
          </a>

          {/* Business Hours */}
          <div className="p-4 bg-input rounded-lg">
            <h4 className="text-heading mb-2">Support Hours</h4>
            <p className="text-body text-sm m-0">
              Monday - Saturday: 9:00 AM - 6:00 PM IST<br />
              Sunday: Closed
            </p>
          </div>

          {/* Note */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-body text-sm m-0">
              We typically respond within 24-48 hours. For urgent issues, please reach out 
              via email with "URGENT" in the subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}