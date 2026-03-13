// =====================================================
// Create Job Screen - Ultra-simplified 4-step flow
// Job → Payment → Time → Confirm (<10 seconds!)
// =====================================================

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { SmartJobInput } from '../components/SmartJobInput';
import { QuickJobButtons } from '../components/QuickJobButtons';
import { SimpleStepIndicator } from '../components/SimpleStepIndicator';
import { DateTimeSelector, dateTimeSelectorToTimeWindow } from '../components/DateTimeSelector';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, IndianRupee, Briefcase } from 'lucide-react';
import { createTask } from '../services/tasks';
import { getCurrentUser } from '../services/auth';
import { useLocation } from '../hooks/useLocation';
import { JobSuggestion, incrementSuggestionPopularity, trackCustomJob, detectIntent, detectEffortLevel } from '../services/jobSuggestions';
import { fireConfetti } from '../utils/confetti';
import { City } from '../types';

interface CreateJobScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigate: (screen: string, data?: any) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  unreadCount: number;
  cities: City[];
  initialQuery?: string; // Pre-fill from home search
}

export function CreateJobScreen({
  onBack,
  onSuccess,
  onNavigate,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  unreadCount,
  cities,
  initialQuery = '',
}: CreateJobScreenProps) {
  const [user, setUser] = useState<any>(null);
  const { location: globalLocation } = useLocation(user?.id || null);
  
  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Job description
  const [jobText, setJobText] = useState(initialQuery);
  const [selectedSuggestion, setSelectedSuggestion] = useState<JobSuggestion | null>(null);
  
  // Step 2: Payment
  const [payment, setPayment] = useState('');
  const [customPayment, setCustomPayment] = useState('');
  const quickPayments = [50, 100, 200, 500];
  
  // Step 3: Time
  const [dateTimeValue, setDateTimeValue] = useState<{
    option: 'anytime' | 'today' | 'custom';
    customDate?: string;
    time?: string;
    timeOption?: 'anytime' | 'specific';
  }>({ option: 'anytime' });
  
  // Step 4: Address (optional)
  const [address, setAddress] = useState('');

  const steps = ['Job', 'Payment', 'Time', 'Confirm'];

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: JobSuggestion) => {
    setJobText(suggestion.title);
    setSelectedSuggestion(suggestion);
    
    // Auto-suggest payment based on typical budget
    const midPoint = Math.round((suggestion.typicalBudgetMin + suggestion.typicalBudgetMax) / 2);
    setPayment(midPoint.toString());
  };

  // Handle quick job selection
  const handleQuickJobSelect = (job: JobSuggestion) => {
    setJobText(job.title);
    setSelectedSuggestion(job);
    
    // Auto-suggest payment
    const midPoint = Math.round((job.typicalBudgetMin + job.typicalBudgetMax) / 2);
    setPayment(midPoint.toString());
    
    // Move to step 2
    setCurrentStep(2);
  };

  // Validate current step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return jobText.trim().length > 3;
      case 2:
        const finalPayment = payment === 'custom' ? customPayment : payment;
        return finalPayment && parseInt(finalPayment) > 0;
      case 3:
        return true; // Time is always valid (default: anytime)
      case 4:
        return true; // Confirm step
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to post a job');
      return;
    }

    if (!globalLocation?.cityId) {
      toast.error('Please set your location first');
      return;
    }

    setLoading(true);

    try {
      // Detect intent and effort if not from suggestion
      const intent = selectedSuggestion?.intent || detectIntent(jobText);
      const effortLevel = selectedSuggestion?.effortLevel || detectEffortLevel(jobText);

      // Get final payment
      const finalPayment = payment === 'custom' ? customPayment : payment;

      // Create task
      const task = await createTask({
        title: jobText,
        description: jobText,
        price: parseInt(finalPayment),
        isNegotiable: false,
        categoryId: 1, // Default category (will be auto-categorized by backend)
        cityId: globalLocation.cityId,
        areaId: globalLocation.areaId || null,
        subAreaId: globalLocation.subAreaId || null,
        latitude: globalLocation.latitude,
        longitude: globalLocation.longitude,
        address: address || undefined,
        timeWindow: dateTimeSelectorToTimeWindow(dateTimeValue),
        // Internal metadata
        intent,
        effortLevel,
      });

      // Track suggestion usage or custom job
      if (selectedSuggestion) {
        await incrementSuggestionPopularity(selectedSuggestion.id);
      } else {
        await trackCustomJob(jobText, intent, effortLevel);
      }

      fireConfetti();
      toast.success('Job posted! Helpers nearby will see it.');
      
      onSuccess();
    } catch (error: any) {
      console.error('[CreateJobScreen] Error creating job:', error);
      toast.error(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={handleBack}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        showLocation={false}
        showBackButton={true}
        onBackClick={handleBack}
        showSearch={false}
        title="Post a Job"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Step Indicator */}
          <SimpleStepIndicator
            currentStep={currentStep}
            totalSteps={4}
            steps={steps}
          />

          {/* Step Content */}
          <div className="mt-8">
            {/* Step 1: Job Description */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">What work do you need done?</h2>
                  <p className="text-gray-600">Describe the job in simple words</p>
                </div>

                <SmartJobInput
                  value={jobText}
                  onChange={setJobText}
                  onSuggestionSelect={handleSuggestionSelect}
                  autoFocus={!initialQuery}
                />

                <QuickJobButtons onSelectJob={handleQuickJobSelect} />
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">How much will you pay?</h2>
                  <p className="text-gray-600">Payment will be made directly to the helper after work is completed</p>
                </div>

                {/* Quick Payment Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickPayments.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setPayment(amount.toString())}
                      className={`py-4 rounded-xl font-semibold text-lg transition-all ${
                        payment === amount.toString()
                          ? 'bg-[#CDFF00] text-black border-2 border-black'
                          : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <button
                  type="button"
                  onClick={() => setPayment('custom')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    payment === 'custom'
                      ? 'bg-[#CDFF00] text-black border-2 border-black'
                      : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Custom Amount
                </button>

                {payment === 'custom' && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700">₹</span>
                    <input
                      type="number"
                      value={customPayment}
                      onChange={(e) => setCustomPayment(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#CDFF00] focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Time */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">When do you need this?</h2>
                  <p className="text-gray-600">Choose your preferred time</p>
                </div>

                <DateTimeSelector
                  value={dateTimeValue}
                  onChange={setDateTimeValue}
                />
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Confirm & Post</h2>
                  <p className="text-gray-600">Review your job details</p>
                </div>

                {/* Summary Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span>Job</span>
                    </div>
                    <div className="font-semibold text-lg">{jobText}</div>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <IndianRupee className="w-4 h-4" />
                      <span>Payment</span>
                    </div>
                    <div className="font-semibold text-2xl text-[#CDFF00]">
                      ₹{payment === 'custom' ? customPayment : payment}
                    </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                    <div className="font-medium">
                      {dateTimeValue.option === 'anytime' && 'Anytime'}
                      {dateTimeValue.option === 'today' && 'Today'}
                      {dateTimeValue.option === 'custom' && dateTimeValue.customDate}
                    </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <div className="font-medium">
                      {globalLocation?.areaName || globalLocation?.cityName || 'Your location'}
                    </div>
                  </div>
                </div>

                {/* Optional: Specific Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific address (Optional)
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Building name, floor, landmarks..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CDFF00] focus:outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom z-40">
        <div className="max-w-2xl mx-auto flex gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Next/Submit Button */}
          <button
            type="button"
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </>
            ) : currentStep === 4 ? (
              <>
                <Check className="w-5 h-5" />
                Post Job
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}