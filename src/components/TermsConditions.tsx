import { motion } from "motion/react";
import { FileText, Hammer, ShieldAlert, CircleAlert, ArrowLeft, HeartHandshake, HelpCircle, MessagesSquare, Ban, Landmark } from "lucide-react";

interface TermsConditionsProps {
  onNavigate: (path: string) => void;
}

export default function TermsConditions({ onNavigate }: TermsConditionsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-20 text-left space-y-12"
      id="terms-conditions-view"
    >


      {/* Header Info */}
      <div className="space-y-4 border-b border-white/[0.08] pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F03220]/10 border border-[#F03220]/20 text-[#F03220]">
          <FileText className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest font-mono">
            LEGAL PLATFORM TERMS
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-sans text-white tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-neutral-400 text-sm font-medium font-mono">
          Last Updated: June 2026 • LocalFelo Platform Administration
        </p>
      </div>

      {/* Crucial Core Position Warning Panel */}
      <div className="p-8 rounded-3xl bg-[#F03220]/5 border border-[#F03220]/20 space-y-3" id="core-position-panel">
        <h2 className="text-base font-extrabold text-[#F03220] tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>IMPORTANT: TECHNOLOGY INTERMEDIARY PLATFORM STATUS</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 leading-normal font-medium">
          LocalFelo is solely a technology platform that connects users who need help with users who are willing to help. 
          <strong className="text-white"> LocalFelo is NOT an employer, an agent, a staffing company, a contractor, a service provider, or an agent for either user. </strong> 
          LocalFelo acts strictly as an intermediary technology platform, and is in no way a party to any task agreements, arrangements, or contracts formed directly between users.
        </p>
      </div>

      {/* Content clauses list */}
      <div className="space-y-12 text-neutral-300 font-medium text-sm sm:text-base leading-relaxed">
        
        {/* Clause 1: Platform Role */}
        <div className="space-y-3" id="clause-platform-role">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <Hammer className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">1. Platform Role & Scope</h2>
          </div>
          <div className="space-y-3 text-neutral-400 text-sm pl-2">
            <p>
              LocalFelo operates only as a digital infrastructure to facilitate discovery, communication, and connection between users in spatial proximity.
            </p>
            <p>
              Task creators (requesters) and helpers independently decide and negotiate:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li>Whether to engage or accept any task request</li>
              <li>The parameters, pricing, and scope of work</li>
              <li>Scheduling, deadlines, and completion criteria</li>
              <li>Direct communications and coordination protocols</li>
            </ul>
            <p>
              LocalFelo does not perform any tasks, does not supervise or audit task execution, and does not control how tasks are executed. We make no representations, warranties, or guarantees concerning task quality, suitability, availability, legality, or final user-to-user outcomes.
            </p>
          </div>
        </div>

        {/* Clause 2: User Responsibility */}
        <div className="space-y-3" id="clause-user-responsibility">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <HelpCircle className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">2. User Responsibility</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2">
            Users bear absolute, single-handed responsibility for the items, descriptions, and tasks they publish, the services or skills they offer, all messaging history, and their personal physical conduct during any real-world interactions. You represent that any information provided to the platform is accurate and truthful.
          </p>
        </div>

        {/* Clause 3: Independent User Relationship */}
        <div className="space-y-3" id="clause-independent-relationship">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <HeartHandshake className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">3. Independent Relationship</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2">
            Any agreement, work schedule, or transaction regarding a task exists completely and directly between the respective users. LocalFelo is not a party, broker, partner, or participant in these covenants. We hold no liability representing either party and maintain no agency relationship.
          </p>
        </div>

        {/* Clause 4: Communication Disclaimer */}
        <div className="space-y-3" id="clause-communication-disclaimer">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <MessagesSquare className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">4. Communication Disclaimer</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2">
            While the platform provides discovery chat lines and communication utilities, LocalFelo does not actively monitor all live messaging. LocalFelo is not responsible or liable for any chat content, statements, promises, external representations, or binding private agreements initiated between users.
          </p>
        </div>

        {/* Clause 5: Task Outcome Disclaimer */}
        <div className="space-y-3" id="clause-outcome-disclaimer">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <CircleAlert className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">5. Task Outcome Disclaimer</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2">
            LocalFelo does not check, audit, or guarantee successful task completion, the skill or quality of work, the character/conduct of the users, task timelines, nor the eventual results. By using the technology platform, users assume all practical or safety risks associated with independent service arrangements.
          </p>
        </div>

        {/* Clause 6: Payments & Transaction Escrow */}
        <div className="space-y-3" id="clause-payments-disclaimer">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#161616] border border-white/5 text-[#F03220]">
              <Landmark className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">6. Payments Processing</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2">
            LocalFelo is a technology intermediary only and does not operate as a bank, financial institution, or licensed payment gateway. All payments, wallet balances, and escrow handling are routed securely through authorized third-party payment partner networks (such as Razorpay or other active providers). Payment processing actions are subject to the terms and privacy regulations of those third-party providers in addition to our platform terms.
          </p>
        </div>

        {/* Clause 7: Prohibited Activities & Account Suspension */}
        <div className="p-8 rounded-3xl bg-[#161616] border border-neutral-900 space-y-6" id="clause-prohibited-rules">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-[#1A1A1A] border border-neutral-900 text-[#F03220]">
              <Ban className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h3 className="text-lg font-extrabold text-white">7. Prohibited Activities & Suspension Policy</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-neutral-400 text-xs sm:text-sm pl-2">
              To support localized platform integrity, users are strictly forbidden from participating in any of the following activities:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-2">
              <div className="p-5 bg-[#0D0D0D] border border-white/[0.04] rounded-2xl space-y-2">
                <span className="text-xs font-bold text-white block uppercase tracking-wide">Fraud & Impersonation</span>
                <span className="text-[11px] text-neutral-500 leading-normal block">Submitting spoofed papers, hijacking profiles, pretending to be another entity, or conducting fake accounts.</span>
              </div>
              <div className="p-5 bg-[#0D0D0D] border border-white/[0.04] rounded-2xl space-y-2">
                <span className="text-xs font-bold text-white block uppercase tracking-wide">Fake or Illegal Tasks</span>
                <span className="text-[11px] text-neutral-500 leading-normal block">Posting spoof work, phantom listings, hazardous materials transfers, or other activities violating spatial local laws.</span>
              </div>
              <div className="p-5 bg-[#0D0D0D] border border-white/[0.04] rounded-2xl space-y-2">
                <span className="text-xs font-bold text-white block uppercase tracking-wide">Abuse & Platform Misuse</span>
                <span className="text-[11px] text-neutral-500 leading-normal block">Initiating harassment, spamming text boxes, manipulating matching channels, or bypassing platform safety systems.</span>
              </div>
            </div>
            <p className="text-neutral-500 text-xs pl-2 pt-2">
              LocalFelo retains full administrative power to suspend, terminate, or lock user accounts immediately upon detecting verified violations of rules, illegal engagements, platform circumventions, or guidelines breaches.
            </p>
          </div>
        </div>

        {/* Clause 8: Limitation of Liability */}
        <div className="space-y-3" id="clause-limitation-liability">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-neutral-900 border border-white/5 text-[#F03220]">
              <ShieldAlert className="w-5 h-5 stroke-[1.5px]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">8. Limitation of Liability</h2>
          </div>
          <p className="text-neutral-400 text-sm pl-2 leading-relaxed">
            To the maximum extent permitted under applicable legislation, LocalFelo, its founders, and affiliates shall carry absolutely NO liability or duty of compensation for disputes between users, damages, thefts, personal injuries, property losses, direct or indirect financial failures, lost business avenues, service quality issues, or user misbehavior happening before, during, or after private user-to-user interactions.
          </p>
        </div>

      </div>
    </motion.div>
  );
}

