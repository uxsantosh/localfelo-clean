import React from 'react';
import { Header } from '../components/Header';
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
    // Update document title
    document.title = 'About LocalFelo - Connecting Communities, Empowering India';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'LocalFelo - India\'s hyperlocal marketplace platform connecting communities for buying, selling, tasks, and wishes. Empowering local communities across India.');
    }
    
    // Cleanup on unmount - restore default description
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
      
      {/* 80% width container */}
      <div className="max-w-[80%] mx-auto py-12">
        <article className="space-y-16">
          
          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Connecting Communities,<br />Empowering India
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              LocalFelo is India's hyperlocal marketplace platform designed to revolutionize how communities 
              interact, transact, and collaborate at the grassroots level. We connect people within local 
              communities for buying & selling products, fulfilling wishes, and completing tasks.
            </p>
          </section>

          {/* Why We Exist */}
          <section className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-black mb-6">Why We Exist</h2>
            <div className="space-y-6 text-gray-800 text-lg leading-relaxed">
              <p>
                We believe that strong communities are built on trust, collaboration, and mutual support. 
                In an increasingly digital world, we saw an opportunity to bring communities closer together 
                through technology.
              </p>
              <p>
                LocalFelo was created to solve a simple problem: <strong className="text-black">people need each other</strong>. 
                Whether it's finding a reliable service, selling unused items, or earning extra income, 
                our platform makes local connections easy, safe, and meaningful.
              </p>
              <p>
                We're building more than a marketplace-we're building a movement that empowers every Indian 
                to participate in their local economy, strengthen their community bonds, and create opportunities 
                right where they live.
              </p>
            </div>
          </section>

          {/* Our Values */}
          <section className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl">
                  🤝
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg mb-2">Community First</h3>
                  <p className="text-gray-700">
                    Every decision we make prioritizes the well-being and growth of our users and their communities.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl">
                  🔒
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg mb-2">Trust & Safety</h3>
                  <p className="text-gray-700">
                    We work tirelessly to create a safe environment where people can connect with confidence.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl">
                  💡
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg mb-2">Simplicity</h3>
                  <p className="text-gray-700">
                    Technology should be accessible to everyone. We keep our platform simple, intuitive, and easy to use.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl">
                  🌱
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg mb-2">Empowerment</h3>
                  <p className="text-gray-700">
                    We believe in empowering people to earn, grow, and succeed through their own skills and efforts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Founder Section */}
          <section className="max-w-4xl mx-auto border-t-2 border-gray-200 pt-16">
            <h2 className="text-3xl font-bold text-black mb-10 text-center">Leadership</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex-shrink-0">
                <img 
                  src={founderImage} 
                  alt="Santosh Kumar K - Founder & CEO of LocalFelo" 
                  className="w-48 h-48 rounded-2xl object-cover border-4 border-gray-200 shadow-lg"
                />
              </div>
              <div className="space-y-4 text-gray-800">
                <div>
                  <h3 className="text-2xl font-bold text-black">Santosh Kumar K</h3>
                  <p className="text-lg text-gray-600 mt-1">Founder & CEO</p>
                </div>
                <p className="text-lg leading-relaxed">
                  Santosh Kumar K is a UI/UX designer and product strategist with a deep understanding of 
                  user behavior and community dynamics. With 10+ years of experience in designing digital products, 
                  he recognized the gap in hyperlocal commerce and set out to build a platform that truly 
                  serves communities.
                </p>
                <p className="text-lg leading-relaxed">
                  His vision for LocalFelo is simple: create a platform where people can connect, transact, 
                  and help each other with the same ease and trust they experience in real-world community 
                  interactions.
                </p>
              </div>
            </div>
          </section>

          {/* Our Commitment */}
          <section className="max-w-4xl mx-auto bg-black text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-6">Our Commitment to India</h2>
            <div className="space-y-4 text-lg leading-relaxed text-white">
              <p className="text-white">
                LocalFelo is committed to building a platform that serves every Indian, from metropolitan 
                cities to small towns and villages. We believe in the power of local communities and are 
                dedicated to creating technology that strengthens, not replaces, human connections.
              </p>
              <p className="text-white">
                We're building LocalFelo to be free, accessible, and community-driven. No hidden fees, 
                no complicated processes-just a simple, powerful tool for people empowering people.
              </p>
              <p className="text-primary font-semibold">
                Together, we're building a stronger, more connected India.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-black mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-700 mb-8">
              Have questions, suggestions, or want to learn more about LocalFelo? We'd love to hear from you.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-black mb-3 text-lg">📧 Email</h3>
                <a 
                  href="mailto:support@localfelo.com"
                  className="text-lg text-black hover:text-primary hover:underline font-medium"
                >
                  support@localfelo.com
                </a>
              </div>
              
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-black mb-3 text-lg">📱 WhatsApp</h3>
                <a 
                  href="https://wa.me/919187608287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-black hover:text-primary hover:underline font-medium"
                >
                  +91-9187608287
                </a>
              </div>
            </div>

            <button
              onClick={handleOpenLocalFelo}
              className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg"
            >
              Explore LocalFelo
            </button>
          </section>

        </article>
      </div>
    </div>
  );
}