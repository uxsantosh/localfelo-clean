import React from 'react';
import { Header } from '../components/Header';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface AboutPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function AboutPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: AboutPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="About LocalFelo" 
        showBack 
        onBack={onBack}
        currentScreen="about"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1vZGVybiUyMG9mZmljZXxlbnwxfHx8fDE3NjQ0MDc3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="About LocalFelo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">About LocalFelo</h1>
            <p className="text-white/90 text-sm lg:text-base">Everything you need, nearby</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-4">
          <h2 className="text-heading">Welcome to LocalFelo</h2>
          
          <p className="text-body">
            LocalFelo is India's fastest hyperlocal platform connecting people for buying, selling, 
            expressing wishes, and getting tasks done - all within your local community.
          </p>

          <h3 className="text-heading">Our Mission</h3>
          <p className="text-body">
            To empower local communities by making it simple to buy, sell, wish for items, and 
            complete tasks nearby. We believe in sustainable living, reducing waste, and helping 
            neighbors support each other.
          </p>

          <h3 className="text-heading">What We Offer</h3>
          <ul className="space-y-2 text-body">
            <li>• <strong>Marketplace:</strong> Buy and sell items locally with zero commission</li>
            <li>• <strong>Wishes:</strong> Express what you're looking for and let sellers come to you</li>
            <li>• <strong>Tasks:</strong> Post real-world work or find tasks to earn money nearby</li>
            <li>• Hyperlocal listings in your city and area</li>
            <li>• Direct contact between buyers and sellers via chat</li>
            <li>• Simple, fast, and free platform</li>
            <li>• Mobile-first experience designed for India</li>
          </ul>

          <h3 className="text-heading">Important Note</h3>
          <p className="text-body">
            LocalFelo is a <strong>mediator-only platform</strong>. We do not handle payments, 
            delivery, or any financial transactions. All deals are directly between users via 
            chat. Please exercise caution and follow our safety guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}