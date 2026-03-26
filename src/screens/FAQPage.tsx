import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQPageProps {
  onBack: () => void;
  onNavigate?: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
}

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-muted transition-colors text-left"
      >
        <span className="font-semibold text-black">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted flex-shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-card border-t border-border">
          <div className="text-body">{answer}</div>
        </div>
      )}
    </div>
  );
}

export function FAQPage({ onBack, onNavigate, isLoggedIn = false, isAdmin = false, userDisplayName }: FAQPageProps): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is LocalFelo?",
          answer: "LocalFelo is India's hyperlocal marketplace platform that connects people in the same city for buying, selling, finding help, and discovering local services. Our platform includes five core modules: Buy & Sell (Marketplace), Wishes (request items/services), Tasks (find helpers/gigs), Professionals (skilled service providers), and Shops (local businesses)."
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is simple! Just enter your mobile number, verify it with an OTP, and complete your basic profile. Your phone number serves as your unique identifier and helps build trust in the community."
        },
        {
          question: "Is LocalFelo free to use?",
          answer: "Yes! LocalFelo is completely free for users to browse, post listings, wishes, and tasks, and contact others. We don't handle payments or charge any transaction fees - all deals happen directly between users."
        },
        {
          question: "Which cities does LocalFelo operate in?",
          answer: "LocalFelo is available across India! We currently support major cities and are rapidly expanding. Set your city and area in your profile to see relevant local listings, wishes, tasks, and services near you."
        }
      ]
    },
    {
      category: "Buy & Sell (Marketplace)",
      questions: [
        {
          question: "How do I list an item for sale?",
          answer: "Go to the Marketplace section, tap the '+' button, select a category, upload clear photos, add a title, description, and price, and publish your listing. Make sure to provide accurate details and honest condition descriptions."
        },
        {
          question: "How do buyers contact me?",
          answer: "Interested buyers can message you directly through LocalFelo's built-in chat feature. You'll receive notifications when someone messages you about your listing. All communication happens on the platform for safety."
        },
        {
          question: "Can I edit or delete my listing?",
          answer: "Yes! Go to your Profile, find 'My Listings', and you can edit details, update photos, mark as sold, or delete the listing anytime."
        },
        {
          question: "What items are prohibited on LocalFelo?",
          answer: "LocalFelo prohibits illegal items, weapons, drugs, counterfeit goods, adult content, live animals, and other restricted categories. View our complete Prohibited Items page for the full list and guidelines."
        }
      ]
    },
    {
      category: "Wishes",
      questions: [
        {
          question: "What are Wishes?",
          answer: "Wishes let you post what you're looking for instead of browsing endless listings. Describe the product or service you need, set your budget (optional), and people who can fulfill your wish will reach out to you via chat."
        },
        {
          question: "Are Wishes only for buying items?",
          answer: "No! You can post wishes for products you want to buy, services you need, or even things you're looking to rent or borrow. It's a flexible way to express what you need help with."
        },
        {
          question: "How do I create a Wish?",
          answer: "Go to the Wishes section, tap '+' button, add a clear title describing what you want, provide detailed description, select category, set your budget (optional), choose your location, and publish. The more specific you are, the better responses you'll get."
        },
        {
          question: "Do I have to set a budget for my Wish?",
          answer: "No, budget is optional! You can leave it blank if you want to receive offers with different price points, or you can set a specific budget to filter responses within your price range."
        },
        {
          question: "How will people contact me about my Wish?",
          answer: "Users who can fulfill your wish will message you directly through the LocalFelo chat system. You'll receive notifications for each response, and you can review their profile and ratings before deciding."
        },
        {
          question: "Can I edit or delete my Wish after posting?",
          answer: "Yes! Go to your Profile, find 'My Wishes', and you can edit details, update descriptions, or delete your wish anytime. Once you've found what you're looking for, you can mark it as fulfilled or delete it."
        }
      ]
    },
    {
      category: "Tasks",
      questions: [
        {
          question: "What are Tasks on LocalFelo?",
          answer: "Tasks are jobs or gigs you need help with - like home repairs, delivery, moving, tutoring, cleaning, and more. Post a task with details and budget, and helpers in your area will apply to complete it for you."
        },
        {
          question: "How do I post a Task?",
          answer: "Go to the Tasks section, tap 'Post Task', select a category, provide a clear title and detailed description, set your budget, add location, specify when you need it done, and publish. Helpers will apply by messaging you."
        },
        {
          question: "How do I become a Helper and find Tasks?",
          answer: "Switch to 'Helper Tasks' tab in the Tasks section to browse available tasks in your area. Filter by category, budget, and distance. When you find a suitable task, message the poster to discuss details and offer your services."
        },
        {
          question: "What's the difference between Helper Mode and regular browsing?",
          answer: "Helper Mode is a quick-access feature that lets active helpers get notified of nearby tasks matching their skills. Set your preferences once, and you'll see relevant task opportunities without manually searching."
        },
        {
          question: "How does payment work for Tasks?",
          answer: "LocalFelo does NOT handle payments. Task posters and helpers agree on the payment method and amount directly. We recommend discussing all payment details before starting work and paying only after the task is completed satisfactorily."
        },
        {
          question: "Can I cancel a Task after posting?",
          answer: "Yes! Go to your Profile, find 'My Tasks', and you can edit, pause, or delete your task anytime. If helpers have already applied, it's courteous to inform them about the cancellation via chat."
        },
        {
          question: "What types of Tasks are allowed?",
          answer: "Most legal service tasks are allowed: home repairs, cleaning, tutoring, delivery, moving, gardening, pet care, event help, and more. Tasks involving illegal activities, adult services, or anything violating our terms are strictly prohibited."
        },
        {
          question: "How do I rate a Helper after task completion?",
          answer: "After your task is completed, go to your task history, find the completed task, and you'll see an option to rate the helper. Provide a star rating and written review to help other users make informed decisions."
        }
      ]
    },
    {
      category: "Professionals",
      questions: [
        {
          question: "What is the Professionals module?",
          answer: "The Professionals module is LocalFelo's directory of verified skilled service providers - plumbers, electricians, carpenters, tutors, photographers, designers, and more. Each professional has a detailed profile with their skills, experience, rates, and customer reviews."
        },
        {
          question: "How is Professionals different from Tasks?",
          answer: "Tasks are one-time gigs posted by users looking for help. Professionals are established service providers with profiles showcasing their expertise, portfolio, certifications, and consistent availability. Use Tasks for quick help, and Professionals for reliable, skilled services."
        },
        {
          question: "How do I find a Professional?",
          answer: "Go to the Professionals section, browse by category (e.g., Home Services, Education, Creative Services), filter by your location and budget, view profiles, check ratings and reviews, and contact them directly via chat to discuss your requirements."
        },
        {
          question: "How do I register as a Professional?",
          answer: "Go to Professionals section, tap 'Become a Professional', choose your service category and role (e.g., Plumber, Tutor, Photographer), provide your business details, upload portfolio/certificates, set your rates and availability, and submit for verification."
        },
        {
          question: "Is there a verification process for Professionals?",
          answer: "Yes! LocalFelo reviews all professional registrations to ensure quality. We verify phone numbers, check submitted documents, and may request additional information. Verified professionals get a badge on their profile, building trust with potential clients."
        },
        {
          question: "Can I have multiple professional profiles?",
          answer: "No, each user can register only ONE professional profile. However, you can add multiple skills/services under that single profile. For example, a handyman can list both plumbing and electrical services."
        },
        {
          question: "How do clients contact me as a Professional?",
          answer: "Clients viewing your professional profile can message you directly through LocalFelo chat. You'll receive notifications for inquiries, and you can discuss project details, pricing, and availability before accepting a job."
        },
        {
          question: "Do I have to pay to register as a Professional?",
          answer: "No! Professional registration on LocalFelo is completely FREE. We don't charge listing fees, commission, or subscription. You keep 100% of what you earn from your services."
        }
      ]
    },
    {
      category: "Shops",
      questions: [
        {
          question: "What is the Shops module?",
          answer: "Shops is LocalFelo's local business directory where small businesses, retailers, restaurants, salons, gyms, and services can create a dedicated storefront. It's like having your own mini-website within LocalFelo to showcase products, services, and connect with local customers."
        },
        {
          question: "How is Shops different from Marketplace listings?",
          answer: "Marketplace is for individual sellers posting one-time items. Shops are for established businesses with ongoing inventory and services. Shops have dedicated pages with business info, multiple products/services, operating hours, location, and customer reviews."
        },
        {
          question: "How do I register my Shop on LocalFelo?",
          answer: "Go to Shops section, tap 'Register Shop', provide business details (name, category, description), add your business address and operating hours, upload logo and shop photos, and submit. After admin verification, your shop goes live."
        },
        {
          question: "What types of businesses can register as Shops?",
          answer: "Almost any local business: retail stores, restaurants, cafes, salons, gyms, repair shops, pharmacies, bookstores, bakeries, boutiques, and service businesses. Businesses must have a physical location or provide local services."
        },
        {
          question: "Can I add products and services to my Shop?",
          answer: "Yes! Once your shop is approved, you can add unlimited products/services with photos, descriptions, and prices. Customers browsing your shop can see your offerings and contact you via chat to place orders or inquire."
        },
        {
          question: "How do customers find my Shop?",
          answer: "Customers can discover your shop by browsing the Shops section by category and location, searching by keywords, or viewing featured shops. Having a complete profile with good photos, detailed descriptions, and positive reviews increases visibility."
        },
        {
          question: "Does LocalFelo handle online orders or payments for Shops?",
          answer: "No. LocalFelo is a discovery and connection platform only. Customers contact shop owners via chat, and all transactions (orders, payments, delivery) are handled directly between the business and customer. We don't process payments or deliveries."
        },
        {
          question: "Is there a fee to register my Shop?",
          answer: "No! Shop registration on LocalFelo is completely FREE. There are no listing fees, monthly subscriptions, or transaction commissions. It's our way of supporting local businesses and helping them connect with nearby customers."
        },
        {
          question: "Can I edit my Shop details after registration?",
          answer: "Yes! Shop owners can edit business details, update operating hours, add/remove products, upload new photos, and manage their shop profile anytime from the 'My Shop' section in their profile."
        }
      ]
    },
    {
      category: "Safety & Trust",
      questions: [
        {
          question: "How does LocalFelo keep users safe?",
          answer: (
            <div className="space-y-2">
              <p>LocalFelo implements multiple safety measures:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Phone verification for all users</li>
                <li>Community rating and review system</li>
                <li>Automatic content moderation and NSFW detection</li>
                <li>Bad word filtering in listings and chats</li>
                <li>Report and block features</li>
                <li>Safety guidelines and best practices</li>
              </ul>
              <p className="mt-2">
                Read our{' '}
                <button 
                  onClick={() => onNavigate?.('safety')}
                  className="text-primary hover:underline font-semibold"
                >
                  Safety Guidelines
                </button>
                {' '}for more tips.
              </p>
            </div>
          )
        },
        {
          question: "What should I do if I encounter a scam or fraud?",
          answer: "Report the user immediately using the report button on their profile or listing. Block them to prevent further contact. LocalFelo takes fraud seriously and will investigate all reports. Never share sensitive personal information or make advance payments."
        },
        {
          question: "How do I report inappropriate content or users?",
          answer: "Every listing, wish, task, and user profile has a report button. Click it, select the reason for reporting, and submit. Our team reviews all reports and takes appropriate action, including removing content or banning users."
        },
        {
          question: "Can I see ratings and reviews before contacting someone?",
          answer: "Yes! Every user has a profile with their overall rating and individual reviews from past transactions. Check ratings before buying, selling, or hiring someone for a task."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I update my profile information?",
          answer: "Go to your Profile section, click 'Edit Profile', and you can update your name, profile photo, gender, and other details. Your phone number cannot be changed as it's your unique identifier."
        },
        {
          question: "Can I change my location?",
          answer: "Yes! You can change your city and area from your profile settings. This will update what listings, wishes, and tasks you see based on your new location."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact us through the Contact page with your account deletion request. We'll permanently delete your account and all associated data within 30 days as per our privacy policy."
        },
        {
          question: "What is the rating system?",
          answer: "LocalFelo uses a 5-star dual rating system. After each transaction or task, both parties can rate each other on two aspects: Overall Experience and Communication. These ratings appear on your profile and help build trust in the community."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "Why am I not receiving OTP during login?",
          answer: "Check your phone number is entered correctly. Ensure you have network coverage. OTP may take up to 2 minutes to arrive. If the problem persists, try again after some time or contact our support team."
        },
        {
          question: "My images are not uploading. What should I do?",
          answer: "LocalFelo automatically compresses images for faster uploads. Ensure you have a stable internet connection. Images larger than 10MB may take longer. Try using a different image or reduce the file size before uploading."
        },
        {
          question: "How do I enable notifications?",
          answer: "Go to your device settings, find LocalFelo in the apps list, and enable notifications. You can also manage notification preferences within the app settings to choose what alerts you want to receive."
        },
        {
          question: "The app is running slow. How can I fix it?",
          answer: "Try clearing your app cache, ensuring you have the latest version installed, and checking your internet connection. If problems persist, uninstall and reinstall the app or contact support."
        }
      ]
    },
    {
      category: "Policies & Legal",
      questions: [
        {
          question: "What is LocalFelo's refund policy?",
          answer: "Since LocalFelo does not handle payments or transactions, we do not have a refund policy. All transactions are peer-to-peer. Disputes should be resolved directly between buyer and seller. We recommend inspecting items before payment."
        },
        {
          question: "How does LocalFelo use my data?",
          answer: (
            <div>
              <p>LocalFelo collects minimal data necessary to operate the platform: phone number, location, and content you post. We never sell your data to third parties. Read our{' '}
                <button 
                  onClick={() => onNavigate?.('privacy')}
                  className="text-primary hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
                {' '}for complete details.
              </p>
            </div>
          )
        },
        {
          question: "What are the Terms of Service?",
          answer: (
            <div>
              <p>By using LocalFelo, you agree to our terms including acceptable use, prohibited items, content guidelines, and dispute resolution. View our complete{' '}
                <button 
                  onClick={() => onNavigate?.('terms')}
                  className="text-primary hover:underline font-semibold"
                >
                  Terms of Service
                </button>
                {' '}for full details.
              </p>
            </div>
          )
        }
      ]
    }
  ];

  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Frequently Asked Questions" 
        showBack 
        onBack={onBack}
        currentScreen="faq"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
      />
      
      <article className="legal-container py-8">
        <div className="card space-y-8">
          {/* Main Heading */}
          <header>
            <h1 className="text-3xl font-bold text-black mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-body">
              Find answers to common questions about using LocalFelo, India's hyperlocal marketplace platform 
              for buying, selling, posting wishes, and finding local help.
            </p>
          </header>

          {/* FAQ Categories */}
          {faqs.map((category, categoryIndex) => {
            const categoryStartIndex = globalIndex;
            const categoryQuestions = category.questions;
            globalIndex += categoryQuestions.length;

            return (
              <section key={categoryIndex}>
                <h2 className="text-2xl font-bold text-black mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {categoryQuestions.map((faq, questionIndex) => {
                    const currentIndex = categoryStartIndex + questionIndex;
                    return (
                      <FAQItem
                        key={currentIndex}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === currentIndex}
                        onToggle={() => handleToggle(currentIndex)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Still Have Questions Section */}
          <section className="pt-4 border-t border-border">
            <h2 className="text-2xl font-bold text-black mb-4">
              Still Have Questions?
            </h2>
            <p className="text-body mb-6">
              We'd love to hear from you! Whether you're an investor, partner, or have general inquiries, reach out to us:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-black mb-2">Email</h3>
                <a 
                  href="mailto:support@localfelo.com"
                  className="text-black hover:text-primary hover:underline text-lg"
                >
                  support@localfelo.com
                </a>
              </div>
              
              <div>
                <h3 className="font-bold text-black mb-2">WhatsApp</h3>
                <a 
                  href="https://wa.me/919187608287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-primary hover:underline text-lg"
                >
                  +91-9187608287
                </a>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}