import React from 'react';
import { Header } from '../components/Header';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface TermsPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function TermsPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: TermsPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Terms & Conditions" 
        showBack 
        onBack={onBack}
        currentScreen="terms"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50JTIwY29udHJhY3R8ZW58MXx8fHwxNzY0NDU4OTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Terms and Conditions"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">Terms & Conditions</h1>
            <p className="text-white/90 text-sm lg:text-base">Our service agreement and guidelines</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-4">
          <h2 className="text-heading">Terms & Conditions</h2>
          <p className="text-muted text-sm">Last updated: November 2024</p>

          <h3 className="text-heading">1. Acceptance of Terms</h3>
          <p className="text-body">
            By accessing and using LocalFelo, you accept and agree to be bound by these Terms 
            of Service. If you do not agree to these terms, please do not use our platform.
          </p>

          <h3 className="text-heading">2. About LocalFelo</h3>
          <p className="text-body">
            LocalFelo is a <strong>hyperlocal marketplace platform</strong> that connects people in India for buying/selling items, posting wishes, and getting help with tasks. We are a <strong>connector platform only</strong> that:
          </p>
          <ul className="space-y-2 text-body">
            <li>• ✅ Provides a platform to post listings, wishes, and tasks</li>
            <li>• ✅ Enables direct communication between users via chat</li>
            <li>• ❌ Does NOT process payments or handle money</li>
            <li>• ❌ Does NOT provide delivery or shipping services</li>
            <li>• ❌ Does NOT verify users or guarantee transactions</li>
            <li>• ❌ Does NOT guarantee work completion or payment for tasks</li>
          </ul>

          <h3 className="text-heading">3. User Accounts</h3>
          <ul className="space-y-2 text-body">
            <li>• You must verify your phone number with OTP to create listings, wishes, or tasks</li>
            <li>• You must provide a valid phone number for contact purposes</li>
            <li>• You are responsible for maintaining the security of your account</li>
            <li>• You must be at least 13 years old to use LocalFelo</li>
          </ul>

          <h3 className="text-heading">4. Platform Guidelines</h3>
          <p className="text-body mb-2">
            <strong>Prohibited Items & Activities:</strong>
          </p>
          <ul className="space-y-2 text-body">
            <li>• Illegal items or services</li>
            <li>• Stolen goods</li>
            <li>• Weapons, explosives, or hazardous materials</li>
            <li>• Drugs, alcohol, or tobacco (if restricted by law)</li>
            <li>• Counterfeit or pirated goods</li>
            <li>• Adult content or services</li>
            <li>• Harassment, hate speech, or abusive behavior</li>
          </ul>

          <h3 className="text-heading">5. User Responsibilities</h3>
          <p className="text-body">
            <strong>All Users Must:</strong>
          </p>
          <ul className="space-y-2 text-body mb-3">
            <li>• Provide accurate information in posts</li>
            <li>• Respond to inquiries respectfully and promptly</li>
            <li>• Meet others in safe, public places</li>
            <li>• Complete agreed transactions honestly</li>
            <li>• Behave respectfully in all interactions</li>
          </ul>
          <p className="text-body">
            <strong>For Tasks & Wishes:</strong>
          </p>
          <ul className="space-y-2 text-body">
            <li>• All payments and work are handled directly between users</li>
            <li>• LocalFelo is NOT involved in task completion or payment disputes</li>
            <li>• Users must discuss and agree on terms before starting work</li>
            <li>• Report any issues or disputes through the platform</li>
          </ul>

          <h3 className="text-heading">6. Safety & Security</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-body mb-2">
              <strong>⚠️ Important Safety Guidelines:</strong>
            </p>
            <ul className="space-y-2 text-body">
              <li>• Meet in public, well-lit places during daytime</li>
              <li>• Bring a friend or family member if possible</li>
              <li>• Never share sensitive financial information</li>
              <li>• Report suspicious activity or scams immediately</li>
              <li>• Trust your instincts - if something feels wrong, walk away</li>
              <li>• For tasks: Confirm payment terms before starting work</li>
            </ul>
          </div>

          <h3 className="text-heading">7. Limitation of Liability</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-body">
              <strong>IMPORTANT:</strong> LocalFelo is a connector platform only. We do NOT:
            </p>
            <ul className="space-y-2 text-body mt-2">
              <li>• Verify the identity of users</li>
              <li>• Verify the accuracy of listings, wishes, or tasks</li>
              <li>• Guarantee task completion or payment</li>
              <li>• Guarantee item quality or authenticity</li>
              <li>• Act as a party to any transaction</li>
              <li>• Provide any warranties of any kind</li>
            </ul>
            <p className="text-body mt-3">
              <strong>You use LocalFelo at your own risk.</strong> We are not responsible for disputes, fraud, 
              non-payment, incomplete work, damaged items, failed transactions, or any loss or injury arising from your use of the platform. <strong>Payments and work are handled directly between users.</strong>
            </p>
          </div>

          <h3 className="text-heading">8. Reporting & Moderation</h3>
          <p className="text-body">
            Users can report inappropriate content or behavior. We reserve the right to:
          </p>
          <ul className="space-y-2 text-body">
            <li>• Remove content that violates our terms</li>
            <li>• Suspend or terminate accounts for violations or abusive behavior</li>
            <li>• Cooperate with law enforcement</li>
            <li>• Modify or discontinue services at any time</li>
          </ul>

          <h3 className="text-heading">9. Privacy</h3>
          <p className="text-body">
            Your privacy is important to us. Please review our Privacy Policy to understand how we 
            collect and use your information. <strong>LocalFelo is not meant for collecting personally identifiable information (PII) or securing sensitive data.</strong>
          </p>

          <h3 className="text-heading">10. Contact Us</h3>
          <p className="text-body">
            For questions about these Terms, contact us at: <strong className="text-primary">contact@localfelo.com</strong>
          </p>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-muted text-sm">
              By using LocalFelo, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service. Use the platform responsibly and safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}