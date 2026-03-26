import React from 'react';
import { Header } from '../components/Header';
import { AlertTriangle, ShieldOff, Ban } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ProhibitedItemsPageProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function ProhibitedItemsPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: ProhibitedItemsPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Prohibited Items" 
        showBack 
        onBack={onBack}
        currentScreen="prohibited"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      {/* Hero Banner */}
      <div className="relative h-[120px] lg:h-[160px] w-full overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1506606401543-2e73709cebb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Prohibited Items"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-500/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-2xl lg:text-3xl mb-2">Prohibited Items & Activities</h1>
            <p className="text-white/90 text-sm lg:text-base">What you cannot post on LocalFelo</p>
          </div>
        </div>
      </div>
      
      <div className="legal-container py-6">
        <div className="card space-y-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-900 font-semibold mb-1">Important Notice</h3>
                <p className="text-red-800 text-sm">
                  Posting prohibited items or engaging in prohibited activities will result in immediate removal of your listing and may lead to account suspension.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-heading mb-2">What You Cannot Post</h2>
            <p className="text-body mb-4">
              To keep LocalFelo safe and legal, the following items and activities are strictly prohibited:
            </p>
          </div>

          {/* Illegal Items */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <ShieldOff className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Illegal Items & Services</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Stolen or illegally obtained goods</li>
              <li>• Counterfeit, replica, or pirated items (fake branded goods, pirated software, etc.)</li>
              <li>• Illegal drugs, narcotics, or prescription medications without proper authorization</li>
              <li>• Items that violate intellectual property rights</li>
              <li>• Illegal wildlife products or endangered species</li>
            </ul>
          </div>

          {/* Dangerous Items */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Dangerous & Restricted Items</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Weapons (guns, knives, explosives, ammunition)</li>
              <li>• Hazardous materials (chemicals, toxic substances)</li>
              <li>• Fireworks or explosives</li>
              <li>• Lock picking tools or burglary equipment</li>
              <li>• Recalled or unsafe products</li>
            </ul>
          </div>

          {/* Adult & Restricted Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Adult & Restricted Content</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Adult content, pornography, or sexual services</li>
              <li>• Tobacco, alcohol (if prohibited by local laws)</li>
              <li>• Items promoting hate speech or discrimination</li>
              <li>• Gambling services or lottery tickets</li>
            </ul>
          </div>

          {/* Animals & Living Things */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Animals & Living Things</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Live animals (except approved pet adoption services)</li>
              <li>• Animal parts or products from endangered species</li>
              <li>• Illegal wildlife trade</li>
            </ul>
          </div>

          {/* Financial & Personal Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <ShieldOff className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Financial Instruments & Personal Data</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Stolen credit cards, bank accounts, or financial credentials</li>
              <li>• Personal information (IDs, passports, Aadhaar cards)</li>
              <li>• Get-rich-quick schemes or pyramid schemes</li>
              <li>• Cryptocurrency scams or unregulated financial services</li>
            </ul>
          </div>

          {/* Prohibited Services */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Prohibited Services</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Illegal services or activities</li>
              <li>• Services requiring professional licenses without proper credentials</li>
              <li>• Medical procedures or unlicensed healthcare services</li>
              <li>• Hacking, data theft, or privacy invasion services</li>
            </ul>
          </div>

          {/* Spam & Fraud */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-red-600" />
              <h3 className="text-heading m-0">Spam & Fraudulent Activities</h3>
            </div>
            <ul className="space-y-1 text-body text-sm">
              <li>• Spam or repetitive duplicate listings</li>
              <li>• Misleading or fraudulent listings</li>
              <li>• Phishing attempts or scams</li>
              <li>• MLM (Multi-Level Marketing) recruitment</li>
              <li>• Bait-and-switch tactics</li>
            </ul>
          </div>

          {/* Consequences */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-heading mb-2">Consequences of Violation</h3>
            <p className="text-body text-sm mb-2">
              If you post prohibited items or engage in prohibited activities:
            </p>
            <ul className="space-y-1 text-body text-sm">
              <li>• Your listing will be immediately removed</li>
              <li>• Your account may be suspended or permanently banned</li>
              <li>• We will cooperate with law enforcement if illegal activity is detected</li>
              <li>• You may be held legally responsible for violations</li>
            </ul>
          </div>

          {/* Reporting */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-heading mb-2">Report Prohibited Content</h3>
            <p className="text-body text-sm">
              If you see a listing that violates these rules, please report it immediately using the "Report" button on the listing page. Your report will be reviewed by our team.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-muted text-sm">
              LocalFelo reserves the right to remove any content that violates these guidelines or is deemed inappropriate. These guidelines may be updated from time to time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}