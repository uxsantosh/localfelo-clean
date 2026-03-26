import React from 'react';
import { Header } from '../components/Header';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQPageProps {
  onBack: () => void;
  onNavigate?: (screen: any) => void;
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
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-bold text-black pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-body flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-body">
          {typeof answer === 'string' ? <p>{answer}</p> : answer}
        </div>
      )}
    </div>
  );
}

export function FAQPage({ 
  onBack, 
  onNavigate, 
  isLoggedIn = false, 
  isAdmin = false, 
  userDisplayName 
}: FAQPageProps): JSX.Element {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Set meta description for SEO
  React.useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Frequently Asked Questions about LocalFelo - India\'s hyperlocal marketplace platform. Learn how to buy, sell, post wishes, find tasks, stay safe, and connect with your local community.');
    }
    
    // Cleanup on unmount - restore default description
    return () => {
      if (metaDescription) {
        metaDescription.setAttribute('content', 'LocalFelo is India\'s leading hyperlocal marketplace platform. Buy & sell locally, post wishes for products you need, and find nearby tasks & services. Connect with your local community for marketplace deals, gigs, and help. Safe, direct peer-to-peer transactions.');
      }
    };
  }, []);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is LocalFelo?",
          answer: "LocalFelo is India's hyperlocal marketplace platform that connects people within local communities. You can buy and sell products, post wishes for items you're looking for, and find or offer help with everyday tasks - all within your community. Our PRIORITY feature is Tasks, where people earn money by helping others."
        },
        {
          question: "How do I sign up for LocalFelo?",
          answer: "Simply download the LocalFelo app or visit our website, enter your phone number, and verify it with the OTP we send you. Once verified, you can set up your profile and start using all features immediately."
        },
        {
          question: "Is LocalFelo free to use?",
          answer: "Yes! LocalFelo is completely free to use. There are no listing fees, no commission on sales, and no subscription charges. You can post unlimited ads, wishes, and tasks at no cost. Helpers earn 100% of what they charge - we take NO commission."
        },
        {
          question: "Which cities does LocalFelo operate in?",
          answer: "LocalFelo operates across India in major cities and towns. You can select your city and area when you sign up. We're constantly expanding to new locations based on user demand."
        }
      ]
    },
    {
      category: "⭐ TASKS - Earn Money by Helping (PRIORITY)",
      questions: [
        {
          question: "What are Tasks on LocalFelo and how can I earn money?",
          answer: (
            <div className="space-y-3">
              <p><strong>Tasks is LocalFelo's PRIORITY feature</strong> that connects people who need help (Task Creators) with people who can help (Helpers).</p>
              <p><strong className="text-primary">💰 Earn Money as a Helper:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Browse tasks posted by people in your area</li>
                <li>Set your own rates - YOU decide how much to charge</li>
                <li>Choose tasks that fit your skills and schedule</li>
                <li>Get paid directly by task creators (cash, UPI, bank transfer)</li>
                <li>Build your reputation with 5-star ratings</li>
                <li>LocalFelo takes ZERO commission - keep 100% of your earnings</li>
              </ul>
              <p className="mt-2"><strong className="text-primary">📝 Post Tasks as a Creator:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Need help with something? Post a task!</li>
                <li>Nearby helpers will offer to help</li>
                <li>Choose your helper based on ratings and price</li>
                <li>Pay directly after work is done</li>
              </ul>
            </div>
          )
        },
        {
          question: "How do I become a Helper and start earning?",
          answer: (
            <div className="space-y-2">
              <p><strong>Step 1:</strong> Enable 'Helper Mode' in your profile settings</p>
              <p><strong>Step 2:</strong> Set your preferences for what types of tasks you want to help with (delivery, repairs, tutoring, photography, etc.)</p>
              <p><strong>Step 3:</strong> Browse available tasks in your area on the Tasks tab</p>
              <p><strong>Step 4:</strong> Chat with task creators, discuss details and pricing</p>
              <p><strong>Step 5:</strong> Complete the task and get paid directly</p>
              <p><strong>Step 6:</strong> Get rated and build your reputation to get more tasks</p>
              <p className="mt-2 text-primary font-semibold">💡 Pro Tip: Complete tasks professionally and earn great ratings to get hired more often!</p>
            </div>
          )
        },
        {
          question: "How do I post a Task as a Creator?",
          answer: (
            <div className="space-y-2">
              <p><strong>Step 1:</strong> Click on the 'Tasks' tab and select 'Post Task'</p>
              <p><strong>Step 2:</strong> Choose the task category (delivery, repair, tutoring, etc.)</p>
              <p><strong>Step 3:</strong> Write a clear description of what help you need</p>
              <p><strong>Step 4:</strong> Set your budget or expected payment range</p>
              <p><strong>Step 5:</strong> Add your location so nearby helpers can find you</p>
              <p><strong>Step 6:</strong> Publish! Helpers will message you with offers</p>
              <p><strong>Step 7:</strong> Review helper profiles, ratings, and offers</p>
              <p><strong>Step 8:</strong> Choose a helper and confirm all details via chat</p>
              <p><strong>Step 9:</strong> After task completion, pay directly and rate the helper</p>
            </div>
          )
        },
        {
          question: "How does payment work for Tasks? Does LocalFelo handle payments?",
          answer: (
            <div className="space-y-2">
              <p><strong className="text-black">CRITICAL: LocalFelo does NOT handle any payments!</strong></p>
              <p><strong>How Payment Works:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Before work starts:</strong> Task Creator and Helper discuss and agree on the payment amount via chat</li>
                <li><strong>During work:</strong> Helper completes the task as agreed</li>
                <li><strong>After completion:</strong> Task Creator pays Helper directly (cash, UPI, Google Pay, PhonePe, bank transfer, etc.)</li>
                <li><strong>Both parties rate each other:</strong> This builds trust in the community</li>
              </ul>
              <p className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                <strong>⚠️ Important:</strong> LocalFelo is NOT involved in payment collection or disputes. Always confirm payment terms BEFORE starting work. Document agreements in chat.
              </p>
            </div>
          )
        },
        {
          question: "What types of tasks can I post or help with?",
          answer: (
            <div className="space-y-2">
              <p><strong>Popular Task Categories:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Delivery & Pickup:</strong> Local delivery, package pickup, bring items from home/office</li>
                <li><strong>Home Services:</strong> Cleaning, cooking assistance, moving help</li>
                <li><strong>Repairs:</strong> Electrical, plumbing, appliance repair, device repair</li>
                <li><strong>Tech Help:</strong> Computer setup, software installation, internet troubleshooting</li>
                <li><strong>Tutoring & Teaching:</strong> Academic subjects, language learning, skill training</li>
                <li><strong>Photography & Videography:</strong> Event photography, product shoots</li>
                <li><strong>Mentorship:</strong> Career guidance, software development, design, startup mentoring</li>
                <li><strong>Ride & Transport:</strong> Short-distance travel assistance</li>
                <li><strong>Any other local help!</strong></li>
              </ul>
            </div>
          )
        },
        {
          question: "Does LocalFelo verify Helpers? How do I know they're trustworthy?",
          answer: (
            <div className="space-y-2">
              <p><strong>LocalFelo does NOT verify helper qualifications or identities.</strong> We use a community-driven trust system:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>5-Star Rating System:</strong> Both task creators and helpers rate each other after every task</li>
                <li><strong>Public Reviews:</strong> Read what others have said about a helper</li>
                <li><strong>Task History:</strong> See how many tasks a helper has completed</li>
                <li><strong>Phone Verification:</strong> All users must verify their phone number</li>
              </ul>
              <p className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                <strong>💡 Safety Tips:</strong> Always check ratings before hiring. Meet in public places when possible. For home services, inform family/friends. Trust your instincts!
              </p>
            </div>
          )
        },
        {
          question: "What if a Helper doesn't complete the task or a Creator doesn't pay?",
          answer: (
            <div className="space-y-2">
              <p><strong className="text-black">LocalFelo is NOT responsible for task completion or payment disputes.</strong></p>
              <p><strong>To protect yourself:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>BEFORE work starts:</strong> Confirm ALL details in chat - payment amount, work scope, timeline</li>
                <li><strong>Document everything:</strong> Use LocalFelo chat to keep written records</li>
                <li><strong>Start small:</strong> For first-time collaborations, start with smaller tasks</li>
                <li><strong>Check ratings:</strong> Work with people who have good ratings</li>
                <li><strong>Trust your gut:</strong> If something feels wrong, don't proceed</li>
              </ul>
              <p className="mt-2"><strong>If issues occur:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Report the user through the app</li>
                <li>Leave an honest rating to warn others</li>
                <li>LocalFelo will investigate serious reports and may ban bad actors</li>
                <li>For legal disputes, users must resolve directly - we are only a connector platform</li>
              </ul>
            </div>
          )
        },
        {
          question: "How much can I earn as a Helper on LocalFelo?",
          answer: (
            <div className="space-y-2">
              <p><strong className="text-primary">You set your own rates and keep 100% of what you earn!</strong></p>
              <p>Your earnings depend on:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Your skills:</strong> Specialized skills (repairs, tutoring, photography) can command higher rates</li>
                <li><strong>Task complexity:</strong> Simple delivery vs. complex repairs</li>
                <li><strong>Your availability:</strong> More time = more tasks = more earnings</li>
                <li><strong>Your ratings:</strong> Higher ratings = more bookings = more money</li>
                <li><strong>Your location:</strong> Busy areas may have more tasks</li>
              </ul>
              <p className="mt-2 bg-primary/10 border border-primary/30 rounded p-2">
                <strong>💰 Examples:</strong> Helpers charge ₹100-500 for simple delivery tasks, ₹500-2000+ for tutoring sessions, ₹1000-5000+ for photography, ₹500-3000+ for repairs. YOU decide your rates!
              </p>
              <p className="mt-2 font-semibold">🚀 LocalFelo takes ZERO commission - every rupee you earn is yours!</p>
            </div>
          )
        }
      ]
    },
    {
      category: "Buy & Sell Marketplace",
      questions: [
        {
          question: "How do I post an item for sale?",
          answer: "Click on the 'Sell' button, select the appropriate category, upload photos of your item, add a title and description, set your price, and publish. Your listing will be visible to people in your local area immediately."
        },
        {
          question: "How do buyers contact me?",
          answer: "Interested buyers can chat with you directly through LocalFelo's built-in chat feature. You'll receive notifications when someone messages you about your listing."
        },
        {
          question: "Does LocalFelo handle payments?",
          answer: "No. LocalFelo is a mediator-only platform. We connect buyers and sellers, but all payment transactions happen directly between you and the other party. This keeps the platform free and simple."
        },
        {
          question: "Does LocalFelo provide delivery services?",
          answer: "No. LocalFelo does not provide delivery services. Buyers and sellers arrange their own meetup locations and delivery methods. We recommend meeting in safe, public places."
        },
        {
          question: "What items are prohibited on LocalFelo?",
          answer: (
            <div className="space-y-2">
              <p>LocalFelo prohibits certain items to ensure user safety and legal compliance:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Weapons, explosives, and ammunition</li>
                <li>Illegal drugs and drug paraphernalia</li>
                <li>Adult content and services</li>
                <li>Stolen or counterfeit goods</li>
                <li>Live animals (pets adoption may be allowed in specific categories)</li>
                <li>Tobacco and alcohol products</li>
              </ul>
              <p className="mt-2">
                View our complete{' '}
                <button 
                  onClick={() => onNavigate?.('prohibited')}
                  className="text-primary hover:underline font-semibold"
                >
                  Prohibited Items list
                </button>
                {' '}for more details.
              </p>
            </div>
          )
        },
        {
          question: "Can I edit or delete my listing after posting?",
          answer: "Yes! You can edit your listing anytime to update the price, description, or photos. You can also mark items as sold or delete listings completely from your profile."
        }
      ]
    },
    {
      category: "Wishes Feature",
      questions: [
        {
          question: "What are Wishes?",
          answer: "Wishes is a unique feature that lets you post what you're looking for instead of browsing listings. If you need a specific item or service, create a wish and people in your area who have it can contact you directly."
        },
        {
          question: "How do I post a Wish?",
          answer: "Go to the Wishes section, click 'Post Wish', describe what you're looking for, set your budget (optional), and publish. People who can fulfill your wish will reach out to you via chat."
        },
        {
          question: "Are Wishes only for buying items?",
          answer: "No! You can post wishes for products you want to buy, services you need, or even things you're looking to rent or borrow. It's a flexible way to express what you need help with."
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