import React from 'react';
import { Header } from '../components/Header';
import { Briefcase, Heart, ShoppingBag, Store, Users, Target, Globe, Shield, Zap } from 'lucide-react';
import founderImage from 'figma:asset/2bd5dd78a06b23e70c38ad64968bf0b44a516dda.png';

interface AboutLocalFeloPageProps {
  onBack: () => void;
  onNavigate?: (screen: any) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

export function AboutLocalFeloPage({ 
  onBack, 
  onNavigate, 
  isLoggedIn = false, 
  isAdmin = false, 
  userDisplayName 
}: AboutLocalFeloPageProps): JSX.Element {
  
  // Set meta description for SEO
  React.useEffect(() => {
    document.title = 'About LocalFelo - Connecting Communities, Empowering India';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'LocalFelo - India\'s hyperlocal marketplace platform with Tasks, Wishes, Buy & Sell, Professionals, and Shops. Connecting communities across India.');
    }
    
    return () => {
      document.title = 'LocalFelo - India\'s Hyperlocal Marketplace';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'LocalFelo is India\'s leading hyperlocal marketplace platform. Buy & sell locally, post wishes for products you need, and find nearby tasks & services. Connect with your local community for marketplace deals, gigs, and help. Safe, direct peer-to-peer transactions.');
      }
    };
  }, []);

  const handleOpenLocalFelo = () => {
    if (onNavigate) {
      onNavigate('home' as any);
    }
  };

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
      
      <div className="max-w-[80%] mx-auto py-12">
        <article className="space-y-16">
          
          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Connecting Communities,<br />Empowering India
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              LocalFelo is India's hyperlocal marketplace platform with five powerful modules designed to revolutionize how communities interact, transact, and collaborate at the grassroots level.
            </p>
          </section>

          {/* Why We Exist */}
          <section className="max-w-4xl mx-auto bg-gradient-to-br from-[#CDFF00]/20 to-white rounded-2xl p-12 border-2 border-[#CDFF00]">
            <h2 className="text-3xl font-bold text-black mb-6">Why We Exist</h2>
            <div className="space-y-6 text-gray-800 text-lg leading-relaxed">
              <p>
                We believe that strong communities are built on trust, collaboration, and mutual support. In today's digital age, local connections have become increasingly important. LocalFelo bridges the gap between the digital world and physical neighborhoods.
              </p>
              <p>
                Whether you need help with a task, looking for something to buy, want to sell a product, searching for a professional service, or discovering local shops - LocalFelo brings your community together.
              </p>
              <p>
                We're not just a marketplace. We're a platform that empowers individuals to earn, save, and connect locally without intermediaries taking commissions or controlling transactions.
              </p>
            </div>
          </section>

          {/* Our Five Modules */}
          <section className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Five Core Modules</h2>
            <div className="space-y-6">
              
              {/* Tasks Module */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl flex-shrink-0">
                    <Briefcase className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3">1. Tasks</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>For Task Creators:</strong> Need help? Post any task - from small errands like picking up groceries to big projects like home renovation. Set your budget and helpers will reach out to you. Perfect for busy professionals, elderly people, and anyone who needs extra hands.
                    </p>
                    <p className="text-gray-700">
                      <strong>For Helpers:</strong> Earn money by helping others! Activate helper mode, browse tasks near you, and pick jobs that match your skills. From delivery to repairs to tutoring - turn your free time into income. Great for students, part-timers, and freelancers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Wishes Module */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl flex-shrink-0">
                    <Heart className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3">2. Wishes</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>For Buyers:</strong> Instead of searching endlessly, just post what you're looking for! Want an iPhone under ₹30k? A bike under ₹50k? A wedding photographer? Post your wish with your budget, and sellers who have it will contact you with offers. Let deals come to you!
                    </p>
                    <p className="text-gray-700">
                      <strong>For Sellers:</strong> Browse wishes posted by buyers near you. If you have what someone is looking for, reach out with your offer! It's reverse marketplace - customers are actively looking, so closing deals is easier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buy & Sell Module */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl flex-shrink-0">
                    <ShoppingBag className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3">3. Buy & Sell Marketplace</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>For Sellers:</strong> List anything for sale - new or used. Phones, bikes, furniture, electronics, vehicles - anything! Upload photos, set your price, and reach buyers in your locality. Zero commission means you keep 100% of your sale amount.
                    </p>
                    <p className="text-gray-700">
                      <strong>For Buyers:</strong> Browse products listed by people near you. Filter by category, price, and location. Chat directly with sellers, inspect products in person, and buy locally. No delivery charges, no waiting - meet and buy the same day!
                    </p>
                  </div>
                </div>
              </div>

              {/* Professionals Module */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl flex-shrink-0">
                    <Users className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3">4. Professionals</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>For Service Seekers:</strong> Find verified professionals near you - plumbers, electricians, tutors, photographers, developers, trainers, and more. View their profiles, check their skills and rates, and hire directly. No middleman commissions!
                    </p>
                    <p className="text-gray-700">
                      <strong>For Professionals:</strong> Create your profile, showcase your skills and work samples, set your rates, and get discovered by customers in your area. Perfect for freelancers, skilled workers, and service providers looking to grow their local client base.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shops Module */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#CDFF00] rounded-xl flex-shrink-0">
                    <Store className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-3">5. Shops</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>For Customers:</strong> Discover local shops near you with their complete catalogs online. Check what products they have, their prices, shop timings, and location before visiting. Support local businesses and shop conveniently!
                    </p>
                    <p className="text-gray-700">
                      <strong>For Shop Owners:</strong> Register your shop, upload your product catalog with photos and prices, set your timings, and get discovered by nearby customers. They can browse your products online and visit your shop to buy. Perfect for small retailers, grocery stores, electronics shops, and local businesses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#CDFF00] rounded-lg">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Platform Only</h3>
                </div>
                <p className="text-gray-700">
                  We don't handle payments, delivery, or transactions. We just connect people. This means no commission, no fees, and complete freedom.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#CDFF00] rounded-lg">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Direct Chat</h3>
                </div>
                <p className="text-gray-700">
                  All communication happens through our built-in chat. No phone numbers shared until you're ready. Safe, private, and convenient.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#CDFF00] rounded-lg">
                    <Globe className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Hyperlocal Focus</h3>
                </div>
                <p className="text-gray-700">
                  Everything is based on your location. Find tasks, products, professionals, and shops near you. Connect with your actual neighbors.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#CDFF00] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#CDFF00] rounded-lg">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Zero Commission</h3>
                </div>
                <p className="text-gray-700">
                  Sell for ₹10,000? Keep ₹10,000. Earn ₹500 from a task? Keep all ₹500. We don't take a cut. Ever.
                </p>
              </div>
            </div>
          </section>

          {/* Our Vision - Black bg with WHITE text */}
          <section className="max-w-4xl mx-auto bg-black rounded-2xl p-12 border-2 border-[#CDFF00]">
            <h2 className="text-3xl font-bold mb-6 text-white">Our Vision</h2>
            <p className="text-xl leading-relaxed text-white">
              To create the most trusted and vibrant hyperlocal community platform in India where neighbors help neighbors, local businesses thrive, and everyone has access to opportunities right in their neighborhood.
            </p>
          </section>

          {/* Founder Section */}
          <section className="max-w-4xl mx-auto bg-white rounded-2xl p-12 border-2 border-gray-200">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Meet the Founder</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img 
                src={founderImage} 
                alt="Santosh Kumar K - Founder of LocalFelo" 
                className="w-48 h-48 rounded-full object-cover border-4 border-[#CDFF00]"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-black">Santosh Kumar K</h3>
                  <p className="text-gray-600 text-lg">Founder & CEO</p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Santosh Kumar K started LocalFelo with a vision to empower India by creating opportunities for people to earn and connect locally. With the belief that technology should bring communities closer, LocalFelo was born to help neighbors help each other - whether it's finding work, buying & selling, or discovering local services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  With over 10+ years of experience in UX design and product strategy, Santosh understands how to build platforms that truly serve people's needs. His mission is to make LocalFelo the most trusted hyperlocal platform in India where everyone has access to opportunities right in their neighborhood.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-4xl mx-auto bg-gradient-to-r from-[#CDFF00] to-[#b8e600] rounded-2xl p-12 text-center border-2 border-black">
            <h2 className="text-3xl font-bold text-black mb-4">
              Join Your Local Community Today
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Whether you want to earn, buy, sell, or connect - LocalFelo has something for everyone
            </p>
            {onNavigate && (
              <button
                onClick={handleOpenLocalFelo}
                className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg"
              >
                Get Started
              </button>
            )}
          </section>
          
        </article>
      </div>
    </div>
  );
}
