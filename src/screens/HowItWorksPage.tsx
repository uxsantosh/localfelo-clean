import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Briefcase, Heart, ShoppingBag, Store, Users } from 'lucide-react';

interface HowItWorksPageProps {
  onBack: () => void;
  onNavigate?: (screen: any) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function HowItWorksPage({ 
  onBack, 
  onNavigate, 
  isLoggedIn = false, 
  isAdmin = false, 
  userDisplayName 
}: HowItWorksPageProps): JSX.Element {
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'wishes' | 'marketplace' | 'professionals' | 'shops'>('tasks');

  // Set meta description and title for SEO
  React.useEffect(() => {
    document.title = 'How LocalFelo Works - Complete Guide to All Features';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how LocalFelo works. Complete guide to Tasks, Wishes, Buy & Sell, Professionals, and Shops. Simple explanations for all user types - creators, helpers, buyers, sellers, and service providers.');
    }
    
    // Cleanup on unmount
    return () => {
      document.title = 'LocalFelo - India\'s Hyperlocal Marketplace';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'LocalFelo is India\'s leading hyperlocal marketplace platform. Buy & sell locally, post wishes for products you need, and find nearby tasks & services. Connect with your local community for marketplace deals, gigs, and help. Safe, direct peer-to-peer transactions.');
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="How It Works" 
        showBack 
        onBack={onBack}
        currentScreen="how-it-works"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            How LocalFelo Works
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Five powerful modules to connect with your local community
          </p>
        </div>

        {/* Tab Navigation - BRANDING COLORS ONLY */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-black text-[#CDFF00] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#CDFF00]'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'wishes'
                ? 'bg-black text-[#CDFF00] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#CDFF00]'
            }`}
          >
            <Heart className="w-5 h-5" />
            Wishes
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-black text-[#CDFF00] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#CDFF00]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Buy & Sell
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'professionals'
                ? 'bg-black text-[#CDFF00] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#CDFF00]'
            }`}
          >
            <Users className="w-5 h-5" />
            Professionals
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'shops'
                ? 'bg-black text-[#CDFF00] shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#CDFF00]'
            }`}
          >
            <Store className="w-5 h-5" />
            Shops
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* TASKS MODULE */}
          {activeTab === 'tasks' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-8 border-2 border-[#CDFF00]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl">
                    <Briefcase className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black">Tasks</h2>
                    <p className="text-gray-600">Get help or help others & earn money</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  Tasks are jobs that need to be done - from small errands to big projects. Post what you need, set your budget, and helpers will reach out to you.
                </p>
              </div>

              {/* For Task Creators */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-[#CDFF00] text-black px-3 py-1 rounded-lg text-sm font-bold">For Task Creators</span>
                  Need something done?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Post Your Task</h4>
                      <p className="text-gray-700">Describe what you need - cleaning, delivery, repairs, tutoring, anything! Be specific about location, time, and requirements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Set Your Budget</h4>
                      <p className="text-gray-700">Decide how much you're willing to pay. Helpers can see your budget and reach out if interested.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Chat with Helpers</h4>
                      <p className="text-gray-700">Helpers will message you. Chat directly, discuss details, negotiate if needed, and choose the best helper.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Get It Done & Pay</h4>
                      <p className="text-gray-700">Meet locally or coordinate remotely. Once done, pay directly to the helper. LocalFelo is just a platform - we don't handle payments.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Task Helpers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">For Helpers</span>
                  Want to earn money?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Activate Helper Mode</h4>
                      <p className="text-gray-700">Turn on helper mode and select what tasks you can help with - delivery, cleaning, repairs, tech support, etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Browse Nearby Tasks</h4>
                      <p className="text-gray-700">See tasks posted near you. Filter by category, budget, and distance. Find tasks that match your skills.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Contact Task Creator</h4>
                      <p className="text-gray-700">Chat with the person who posted the task. Discuss timing, location, and any special requirements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Complete & Get Paid</h4>
                      <p className="text-gray-700">Do the task as agreed. Get paid directly by the task creator. Build your reputation by completing tasks well!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WISHES MODULE */}
          {activeTab === 'wishes' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-8 border-2 border-[#CDFF00]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl">
                    <Heart className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black">Wishes</h2>
                    <p className="text-gray-600">Post what you're looking for & let sellers reach you</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  Wishes let you post exactly what product or service you're looking for. Sellers who have it will contact you with their offers - you don't have to search!
                </p>
              </div>

              {/* For Buyers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-[#CDFF00] text-black px-3 py-1 rounded-lg text-sm font-bold">For Buyers</span>
                  Looking for something?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Post Your Wish</h4>
                      <p className="text-gray-700">Describe what you need - iPhone 14 under ₹30k, bike under ₹50k, laptop for coding, wedding photographer, etc. Be specific!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Set Your Budget</h4>
                      <p className="text-gray-700">Mention your maximum price. This helps sellers know if they can offer something within your range.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Sellers Will Contact You</h4>
                      <p className="text-gray-700">Sit back and wait! Sellers who have what you want will message you with their offers, prices, and photos.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Compare & Choose</h4>
                      <p className="text-gray-700">Compare offers from different sellers. Chat, negotiate, ask questions, and buy from whoever offers the best deal!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Sellers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">For Sellers</span>
                  Have something to sell?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Browse Wishes Nearby</h4>
                      <p className="text-gray-700">Check what people in your area are looking for. You'll see wishes with budgets and requirements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Find Matching Wishes</h4>
                      <p className="text-gray-700">Look for wishes that match what you have. If someone wants an iPhone and you're selling one - perfect match!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Send Your Offer</h4>
                      <p className="text-gray-700">Message the buyer with your price, photos, and product details. Be quick - other sellers might contact them too!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Close the Deal</h4>
                      <p className="text-gray-700">If the buyer is interested, chat to finalize details. Meet locally, show the product, and complete the sale directly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MARKETPLACE (BUY & SELL) MODULE */}
          {activeTab === 'marketplace' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-8 border-2 border-[#CDFF00]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl">
                    <ShoppingBag className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black">Buy & Sell Marketplace</h2>
                    <p className="text-gray-600">List products & browse local deals</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  The marketplace is where you list products for sale and browse what others are selling nearby. From phones to bikes to furniture - sell anything locally!
                </p>
              </div>

              {/* For Sellers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-[#CDFF00] text-black px-3 py-1 rounded-lg text-sm font-bold">For Sellers</span>
                  Got something to sell?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Create Your Listing</h4>
                      <p className="text-gray-700">Post what you're selling - upload clear photos, write a good description, set your price. The better the listing, the faster it sells!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Choose Category & Location</h4>
                      <p className="text-gray-700">Select the right category (Electronics, Vehicles, Furniture, etc.) and your location so nearby buyers can find you easily.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Buyers Will Contact You</h4>
                      <p className="text-gray-700">Interested buyers will message you. Answer their questions, share more photos if needed, and negotiate the price.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Meet & Sell</h4>
                      <p className="text-gray-700">Arrange to meet in a safe public place. Show the product, finalize the deal, and get paid directly. No commission to LocalFelo!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Buyers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">For Buyers</span>
                  Looking to buy something?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Browse Listings</h4>
                      <p className="text-gray-700">Explore products listed near you. Use filters for category, price range, and location to find exactly what you need.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Check Product Details</h4>
                      <p className="text-gray-700">View photos, read descriptions, check the price and location. Make sure it matches what you're looking for.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Chat with Seller</h4>
                      <p className="text-gray-700">Message the seller directly. Ask questions about condition, usage, warranty, negotiable price, etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Inspect & Buy</h4>
                      <p className="text-gray-700">Meet the seller, inspect the product in person. If everything looks good, buy it! Always meet in safe public locations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONALS MODULE */}
          {activeTab === 'professionals' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-8 border-2 border-[#CDFF00]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl">
                    <Users className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black">Professionals</h2>
                    <p className="text-gray-600">Find verified service providers near you</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  Professionals are people offering skilled services - plumbers, electricians, tutors, photographers, developers, and more. Browse profiles and hire directly.
                </p>
              </div>

              {/* For Service Seekers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-[#CDFF00] text-black px-3 py-1 rounded-lg text-sm font-bold">For Service Seekers</span>
                  Need a professional?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Search by Service</h4>
                      <p className="text-gray-700">Browse professionals by category - Home Services (plumber, electrician), Education (tutors), Tech (developers), Creative (photographers), etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">View Profiles</h4>
                      <p className="text-gray-700">Check their skills, experience, photos of past work, rates, and location. Read what services they offer.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Contact & Discuss</h4>
                      <p className="text-gray-700">Message the professional directly. Discuss your requirements, ask about pricing, availability, and timeline.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Hire & Pay Directly</h4>
                      <p className="text-gray-700">Once agreed, hire them for your project. Pay directly to the professional after work is done. No platform fees!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Professionals */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">For Professionals</span>
                  Offering a service?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Create Your Profile</h4>
                      <p className="text-gray-700">Add your photo, list your skills and services, mention your experience, upload work samples or certificates.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Set Your Rates</h4>
                      <p className="text-gray-700">Mention your pricing - hourly rate, project-based, or minimum charges. Be transparent about what you charge.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Get Discovered</h4>
                      <p className="text-gray-700">People searching for your service will find your profile. They'll see your skills, rates, and past work.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Get Hired & Earn</h4>
                      <p className="text-gray-700">Chat with interested clients, discuss project details, and close deals. Get paid directly with no commission to LocalFelo!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SHOPS MODULE */}
          {activeTab === 'shops' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-8 border-2 border-[#CDFF00]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl">
                    <Store className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black">Shops</h2>
                    <p className="text-gray-600">Discover local shops with full catalogs</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  Local shops can list their entire product catalog online. Customers can browse products, check prices, and visit shops to buy. Perfect for supporting local businesses!
                </p>
              </div>

              {/* For Customers */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-[#CDFF00] text-black px-3 py-1 rounded-lg text-sm font-bold">For Customers</span>
                  Looking for local shops?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Browse Nearby Shops</h4>
                      <p className="text-gray-700">Find shops near you by category - grocery, electronics, clothing, furniture, etc. See shop details and timings.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Check Product Catalog</h4>
                      <p className="text-gray-700">View all products sold by the shop online with photos and prices. Know what's available before visiting!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Contact Shop Owner</h4>
                      <p className="text-gray-700">Message the shop to ask about product availability, pricing, or any special requests.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#CDFF00] rounded-full flex items-center justify-center font-bold text-black">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Visit & Buy</h4>
                      <p className="text-gray-700">Visit the shop at the address shown, check products in person, and buy directly from the shop owner.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Shop Owners */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold">For Shop Owners</span>
                  Have a local shop?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Register Your Shop</h4>
                      <p className="text-gray-700">Add shop details - name, address, category, timings, photos. Make your shop discoverable to local customers.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Upload Product Catalog</h4>
                      <p className="text-gray-700">List all your products with photos, names, and prices. Let customers browse your entire inventory online!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Get Discovered Locally</h4>
                      <p className="text-gray-700">People nearby will find your shop when searching. They can see what you sell before visiting.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-black">Sell More</h4>
                      <p className="text-gray-700">Customers visit knowing exactly what you have. Increase foot traffic and sales by being visible online!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Important Notes - BRANDING COLORS ONLY */}
        <div className="mt-12 bg-[#CDFF00]/20 border-2 border-[#CDFF00] rounded-2xl p-6">
          <h3 className="text-xl font-bold text-black mb-3">⚠️ Important to Know</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-black font-bold">•</span>
              <span><strong>LocalFelo is a platform only</strong> - We connect people. We don't handle payments, delivery, or transactions.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-black font-bold">•</span>
              <span><strong>No commission or fees</strong> - Pay/get paid directly. We don't take any cut from your earnings or purchases.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-black font-bold">•</span>
              <span><strong>Meet safely</strong> - Always meet in public places for transactions. Inspect products before paying.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-black font-bold">•</span>
              <span><strong>Chat first</strong> - Discuss all details through chat before meeting. Clear communication prevents misunderstandings.</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-[#CDFF00] to-[#b8e600] rounded-2xl p-8 text-center border-2 border-black">
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg text-black/80 mb-6">
            Join your local community today!
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
