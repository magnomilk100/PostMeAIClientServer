import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4';
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5';
import OnboardingStep6 from '@/components/onboarding/OnboardingStep6';
import OnboardingStep7 from '@/components/onboarding/OnboardingStep7';

interface OnboardingData {
  profileType: string;
  fullName: string;
  role: string;
  website: string;
  companyName: string;
  industry: string;
  teamSize: string;
  interestedPlatforms: string[];
  primaryGoals: string[];
  timezone: string;
  language: string;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profileType: 'individual',
    fullName: '',
    role: '',
    website: '',
    companyName: '',
    industry: '',
    teamSize: '',
    interestedPlatforms: [],
    primaryGoals: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en'
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save onboarding data');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Welcome to PostMeAI!",
        description: "Your onboarding is complete. Let's start creating amazing content!",
      });
      
      // No navigation needed - modal will close automatically when user.onboardingCompleted becomes true
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Modal will be closed automatically by Layout component when user.onboardingCompleted becomes true

  // Load existing onboarding data if available
  useEffect(() => {
    if (user) {
      setOnboardingData(prev => ({
        ...prev,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '',
        role: user.role || '',
        website: user.website || '',
        companyName: user.companyName || '',
        industry: user.industry || '',
        teamSize: user.teamSize || '',
        timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: user.language || 'en',
        profileType: user.profileType || 'individual',
        primaryGoals: user.primaryGoals || [],
        interestedPlatforms: user.interestedPlatforms || []
      }));
    }
  }, [user]);

  // Don't render the modal if user has already completed onboarding or is loading
  if (!user) {
    return null; // Still loading user data
  }

  if (user.onboardingCompleted) {
    return null; // User has already completed onboarding
  }

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const saveStepData = async () => {
    try {
      await saveOnboardingMutation.mutateAsync(onboardingData);
    } catch (error) {
      console.error('Failed to save step data:', error);
    }
  };

  const nextStep = async () => {
    if (currentStep < 7) {
      await saveStepData();
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (completeOnboardingMutation.isPending) return; // Prevent multiple submissions
    
    try {
      await completeOnboardingMutation.mutateAsync(onboardingData);
    } catch (error) {
      // Error handling is done in mutation onError
      console.error('Onboarding completion failed:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return onboardingData.profileType !== '';
      case 3:
        if (onboardingData.profileType === 'individual') {
          return onboardingData.fullName.trim() !== '';
        } else {
          return onboardingData.companyName.trim() !== '' && onboardingData.industry !== '';
        }
      case 4:
        return onboardingData.interestedPlatforms.length > 0;
      case 5:
        return onboardingData.primaryGoals.length > 0;
      case 6:
        return onboardingData.timezone !== '' && onboardingData.language !== '';
      default:
        return true;
    }
  };

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 />;
      case 2:
        return <OnboardingStep2 data={onboardingData} updateData={updateOnboardingData} />;
      case 3:
        return <OnboardingStep3 data={onboardingData} updateData={updateOnboardingData} />;
      case 4:
        return <OnboardingStep4 data={onboardingData} updateData={updateOnboardingData} />;
      case 5:
        return <OnboardingStep5 data={onboardingData} updateData={updateOnboardingData} />;
      case 6:
        return <OnboardingStep6 data={onboardingData} updateData={updateOnboardingData} />;
      case 7:
        return <OnboardingStep7 data={onboardingData} updateData={updateOnboardingData} />;
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / 7) * 100;

  return (
    <Card className="w-full bg-white dark:bg-gray-900 shadow-2xl border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to PostMeAI
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Let's get you set up with a personalized experience in just a few steps.
        </CardDescription>
      </CardHeader>
      <CardContent>

        <div className="mt-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of 7
              </span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Main Content */}
          <div className="mb-8">
            {getStepComponent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 7 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={completeOnboarding}
                  disabled={completeOnboardingMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {completeOnboardingMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}