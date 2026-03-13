import React from 'react';
import { Header } from '../components/Header';
import { Shield, Eye, Users, Phone, CreditCard, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface SafetyPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function SafetyPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: SafetyPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Safety Guidelines" 
        showBack 
        onBack={onBack}
        currentScreen="safety"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1761805364358-1a4446ffb0ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZldHklMjBzZWN1cml0eSUyMHNoaWVsZHxlbnwxfHx8fDE3NjQzMzQ4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Safety Guidelines"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">Stay Safe on LocalFelo</h1>
            <p className="text-white/90 text-sm lg:text-base">Your safety is our priority</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-6">
          <div>
            <h2 className="text-heading mb-2">Safety First</h2>
            <p className="text-body">
              Follow these important safety tips to protect yourself when buying or selling.
            </p>
          </div>

          {/* Meeting Safely */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="text-heading m-0">Meet in Public Places</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Always meet in well-lit, public locations</li>
              <li>• Prefer busy areas like malls, cafes, or metro stations</li>
              <li>• Avoid meeting at your home or the seller's home</li>
              <li>• Meet during daytime hours when possible</li>
            </ul>
          </div>

          {/* Bring Someone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-heading m-0">Bring a Friend</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Take someone with you when meeting buyers/sellers</li>
              <li>• Inform family or friends about your meeting location</li>
              <li>• Share meeting details with someone you trust</li>
            </ul>
          </div>

          {/* Inspect Thoroughly */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-heading m-0">Inspect Before Paying</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Carefully examine the item before making payment</li>
              <li>• Test electronics and check for damages</li>
              <li>• Verify authenticity of branded items</li>
              <li>• Don't hesitate to walk away if something feels wrong</li>
            </ul>
          </div>

          {/* Payment Safety */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="text-heading m-0">Safe Payment Practices</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Never pay in advance without seeing the item</li>
              <li>• Prefer cash for in-person transactions</li>
              <li>• If using digital payment, verify the item first</li>
              <li>• Get a receipt or written confirmation</li>
              <li>• Avoid wire transfers to unknown parties</li>
            </ul>
          </div>

          {/* Communication */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-heading m-0">Smart Communication</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Keep conversations within the platform when possible</li>
              <li>• Be cautious of deals that seem too good to be true</li>
              <li>• Watch out for urgency tactics or pressure to decide quickly</li>
              <li>• Never share sensitive personal information</li>
            </ul>
          </div>

          {/* Red Flags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-destructive" />
              <h3 className="text-heading m-0">Red Flags to Watch For</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Prices significantly below market value</li>
              <li>• Sellers unwilling to meet in person</li>
              <li>• Requests for payment before viewing the item</li>
              <li>• Poor quality photos or vague descriptions</li>
              <li>• Pressure to complete the deal quickly</li>
              <li>• Requests to move conversation off-platform immediately</li>
            </ul>
          </div>

          {/* Report Suspicious */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="text-heading mb-2">Report Suspicious Activity</h4>
            <p className="text-body text-sm m-0">
              If you encounter fraud, scams, or suspicious behavior, please report it 
              immediately. Your safety is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}