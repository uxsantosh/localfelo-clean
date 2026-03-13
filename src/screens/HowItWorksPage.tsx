import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Briefcase, Heart, ShoppingBag, ArrowRight, MessageCircle, MapPin, IndianRupee, CheckCircle, Search, Plus, Sparkles } from 'lucide-react';

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
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'wishes' | 'marketplace'>('tasks');

  // Set meta description and title for SEO
  React.useEffect(() => {
    document.title = 'How LocalFelo Works - Simple Guide to Tasks, Wishes & Marketplace';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how LocalFelo works. Step-by-step guide to posting tasks, creating wishes, and buying & selling in your local community. Simple, visual explanations for all features.');
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
            Three simple features to connect with your local community
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'tasks'
                ? 'bg-black text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-black'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'wishes'
                ? 'bg-black text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-black'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Wishes
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-black text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-black'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Buy & Sell
          </button>
        </div>

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-16">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
              <div className="inline-block p-4 bg-black rounded-2xl mb-4">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">Tasks</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Need help with something? Post a task and let local helpers earn money by helping you. 
                From delivery to repairs, tutoring to cleaning-get work done easily.
              </p>
            </div>

            {/* For Task Creators */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Task Creators (Need Help)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Post Your Task</h4>
                  <p className="text-sm text-gray-700">
                    Describe what you need help with, set your price, and add your location
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Helpers Find You</h4>
                  <p className="text-sm text-gray-700">
                    Local helpers see your task and can reach out to help you
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Chat & Coordinate</h4>
                  <p className="text-sm text-gray-700">
                    Discuss details, confirm the helper, and arrange meeting time
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Task Complete</h4>
                  <p className="text-sm text-gray-700">
                    Helper completes work, you pay directly, and both rate each other
                  </p>
                </div>
              </div>
            </div>

            {/* For Helpers */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Helpers (Earn Money)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Activate Helper Mode</h4>
                  <p className="text-sm text-gray-700">
                    Turn on helper mode and select categories you can help with
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Browse Nearby Tasks</h4>
                  <p className="text-sm text-gray-700">
                    See tasks posted near you that match your skills
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Connect & Accept</h4>
                  <p className="text-sm text-gray-700">
                    Chat with task creator, confirm details, and accept the task
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <IndianRupee className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Complete & Earn</h4>
                  <p className="text-sm text-gray-700">
                    Finish the task, get paid directly-100% of earnings go to you
                  </p>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-black text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">💡 Good to Know</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">100% Commission-Free:</strong> Helpers keep every rupee they earn-no platform fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Direct Payment:</strong> You handle payments directly with each other-LocalFelo doesn't process money</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Rate & Build Trust:</strong> Both parties rate each other to build community reputation</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* WISHES TAB */}
        {activeTab === 'wishes' && (
          <div className="space-y-16">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
              <div className="inline-block p-4 bg-black rounded-2xl mb-4">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">Wishes</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                India's first wish-based marketplace. Looking for something specific? Post a wish and 
                let sellers come to you with their offers.
              </p>
            </div>

            {/* For Wishers (Buyers) */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Buyers (Post a Wish)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Sparkles className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Post Your Wish</h4>
                  <p className="text-sm text-gray-700">
                    Describe what you're looking for, set your budget, and add location
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Sellers Find You</h4>
                  <p className="text-sm text-gray-700">
                    Local sellers see your wish and reach out if they can fulfill it
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Compare Offers</h4>
                  <p className="text-sm text-gray-700">
                    Receive multiple offers, chat with sellers, and choose the best one
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Meet & Buy</h4>
                  <p className="text-sm text-gray-700">
                    Meet the seller locally, complete the purchase, and rate your experience
                  </p>
                </div>
              </div>
            </div>

            {/* For Sellers */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Sellers (Fulfill Wishes)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Browse Wishes</h4>
                  <p className="text-sm text-gray-700">
                    See what people near you are looking for
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Contact Buyers</h4>
                  <p className="text-sm text-gray-700">
                    If you have what they want, reach out and make an offer
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <IndianRupee className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Negotiate & Agree</h4>
                  <p className="text-sm text-gray-700">
                    Discuss price, condition, and meeting details
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Sell & Earn</h4>
                  <p className="text-sm text-gray-700">
                    Complete the sale, get paid directly, no fees deducted
                  </p>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-black text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">💡 Good to Know</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Reverse Marketplace:</strong> Instead of searching for products, sellers find you</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Zero Listing Fees:</strong> Post unlimited wishes-completely free</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Local First:</strong> Connect with sellers in your area for quick, easy exchanges</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* MARKETPLACE TAB */}
        {activeTab === 'marketplace' && (
          <div className="space-y-16">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center">
              <div className="inline-block p-4 bg-black rounded-2xl mb-4">
                <ShoppingBag className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">Buy & Sell</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                A local marketplace to buy and sell products in your community. 
                From electronics to furniture, clothes to vehicles-list anything.
              </p>
            </div>

            {/* For Sellers */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Sellers (List Products)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Create Listing</h4>
                  <p className="text-sm text-gray-700">
                    Add photos, title, description, price, and category
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Buyers Find You</h4>
                  <p className="text-sm text-gray-700">
                    Your listing appears to buyers searching in your area
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Chat with Buyers</h4>
                  <p className="text-sm text-gray-700">
                    Answer questions, negotiate price, and arrange meetup
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl text-black mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Sell & Get Paid</h4>
                  <p className="text-sm text-gray-700">
                    Meet locally, hand over the item, and receive payment
                  </p>
                </div>
              </div>
            </div>

            {/* For Buyers */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                For Buyers (Find Products)
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    1
                  </div>
                  <div className="mb-3">
                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Browse Listings</h4>
                  <p className="text-sm text-gray-700">
                    Search and filter products available near you
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    2
                  </div>
                  <div className="mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Contact Seller</h4>
                  <p className="text-sm text-gray-700">
                    Chat to ask questions, check condition, and negotiate
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    3
                  </div>
                  <div className="mb-3">
                    <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Arrange Meetup</h4>
                  <p className="text-sm text-gray-700">
                    Agree on meeting location, time, and final price
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-primary/30">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-xl text-white mb-4">
                    4
                  </div>
                  <div className="mb-3">
                    <CheckCircle className="w-8 h-8 text-gray-400 mb-2" />
                  </div>
                  <h4 className="font-bold text-black mb-2">Buy & Rate</h4>
                  <p className="text-sm text-gray-700">
                    Inspect item, make payment, and rate your experience
                  </p>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-black text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">💡 Good to Know</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Unlimited Listings:</strong> Sell as many items as you want-no listing fees or commissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Local Deals:</strong> Buy from people nearby-see items before purchasing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Safe Transactions:</strong> Always meet in public places and verify items before paying</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16 bg-gradient-to-br from-primary/20 to-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of people in your area who are already connecting, buying, selling, 
            and helping each other on LocalFelo.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg inline-flex items-center gap-2"
          >
            Start Using LocalFelo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}