import React from 'react';
import { Header } from '../components/Header';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface PrivacyPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function PrivacyPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: PrivacyPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Privacy Policy" 
        showBack 
        onBack={onBack}
        currentScreen="privacy"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1603985529862-9e12198c9a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YWN5JTIwZGF0YSUyMHByb3RlY3Rpb258ZW58MXx8fHwxNzY0NDU4OTc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Privacy Policy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">Privacy Policy</h1>
            <p className="text-white/90 text-sm lg:text-base">How we protect your data</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-4">
          <h2 className="text-heading">Privacy Policy</h2>
          <p className="text-muted text-sm">Last updated: November 2024</p>

          <h3 className="text-heading">1. Information We Collect</h3>
          <p className="text-body">We collect the following information:</p>
          <ul className="space-y-2 text-body">
            <li>• <strong>Account Information:</strong> Name and phone number (verified via OTP)</li>
            <li>• <strong>Listing Information:</strong> Product details, images, pricing, and location you provide</li>
            <li>• <strong>Contact Information:</strong> Phone numbers and WhatsApp numbers for buyer-seller communication</li>
            <li>• <strong>Usage Data:</strong> How you interact with our platform</li>
          </ul>

          <h3 className="text-heading">2. How We Use Your Information</h3>
          <p className="text-body">Your information is used to:</p>
          <ul className="space-y-2 text-body">
            <li>• Create and manage your account</li>
            <li>• Display your listings to potential buyers</li>
            <li>• Enable communication between buyers and sellers</li>
            <li>• Improve our platform and user experience</li>
            <li>• Prevent fraud and enforce our terms</li>
          </ul>

          <h3 className="text-heading">3. Information Sharing</h3>
          <p className="text-body">
            <strong>Public Information:</strong> When you create a listing, your name, phone number, and listing details 
            are visible to all users browsing LocalFelo.
          </p>
          <p className="text-body mt-2">
            <strong>We do NOT:</strong>
          </p>
          <ul className="space-y-2 text-body">
            <li>• Sell your personal information to third parties</li>
            <li>• Process payments or store financial information (we're a mediator-only platform)</li>
          </ul>

          <h3 className="text-heading">4. Data Security</h3>
          <p className="text-body">
            We use industry-standard security measures to protect your information. However, no method of transmission 
            over the internet is 100% secure. Please use caution when sharing personal information.
          </p>

          <h3 className="text-heading">5. Your Rights</h3>
          <p className="text-body">You have the right to:</p>
          <ul className="space-y-2 text-body">
            <li>• Access and update your profile information</li>
            <li>• Delete your listings at any time</li>
            <li>• Request account deletion by contacting us</li>
          </ul>

          <h3 className="text-heading">6. Third-Party Services</h3>
          <p className="text-body">
            LocalFelo uses:
          </p>
          <ul className="space-y-2 text-body">
            <li>• <strong>Supabase:</strong> For database and authentication services</li>
          </ul>

          <h3 className="text-heading">7. Children's Privacy</h3>
          <p className="text-body">
            LocalFelo is not intended for users under 13 years of age. We do not knowingly collect information from children.
          </p>

          <h3 className="text-heading">8. Changes to This Policy</h3>
          <p className="text-body">
            We may update this Privacy Policy from time to time. We will notify users of any significant changes.
          </p>

          <h3 className="text-heading">9. Contact Us</h3>
          <p className="text-body">
            If you have questions about this Privacy Policy, please contact us at: <strong className="text-primary">contact@localfelo.com</strong>
          </p>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-muted text-sm">
              <strong>Note:</strong> LocalFelo is a mediator-only platform. We do NOT handle payments, delivery, 
              or financial transactions. All transactions occur directly between buyers and sellers. We are not 
              responsible for the quality, safety, or legality of items listed, or the accuracy of listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}