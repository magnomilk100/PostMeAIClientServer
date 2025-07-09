import { createContext, useContext, useState, ReactNode } from 'react';

interface PlatformConfig {
  title: boolean;
  body: boolean;
  image: boolean;
  imageCount?: number;
  video: boolean;
  videoDuration?: number;
  carousel: boolean;
  carouselCount?: number;
  hashtags: boolean;
  thumbnails?: boolean; // YouTube only
}

interface ScheduleConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'calendar';
  daily?: Array<{ hour: number; minute: number }>;
  weekly?: Array<{ dayOfWeek: string; hour: number; minute: number }>;
  monthly?: Array<{ dayOfMonth: number; hour: number; minute: number }>;
  calendar?: Array<{ date: string; hour: number; minute: number }>;
}

interface WizardData {
  // Step 1: Creation Mode
  creationMode: 'ai' | 'manual';
  
  // Step 2: AI Content Generation
  aiContent?: {
    subject?: string;
    language?: string;
  };
  
  // Step 3: Social Media Platforms
  selectedPlatforms: string[];
  platforms?: string[]; // Alternative field name for compatibility
  
  // Step 4: Post Format/Style
  platformConfigs: Record<string, PlatformConfig>;
  platformStates?: Record<string, boolean>; // Track active/inactive state for each platform
  
  // Step 5: Schedule
  scheduleConfig: ScheduleConfig;
  
  // Step 6: Review & Publish Options
  reviewOptions?: {
    publishMode?: 'review' | 'auto';
    reviewEmailEnabled?: boolean;
    reviewEmail?: string;
    autoEmailEnabled?: boolean;
    autoEmail?: string;
  };
  
  // Step 7: Links
  links: {
    website?: string;
    link1?: string;
    link2?: string;
  };

  // Schedule Configuration Enhancement
  postJustOnce?: boolean;
  postImmediately?: boolean;
  
  // Separate calendar schedules for different modes
  normalCalendarSchedules?: Array<{ date: string; hour: number; minute: number }>;
  postOnceCalendarSchedules?: Array<{ date: string; hour: number; minute: number }>;
}

interface ScheduleWizardContextType {
  currentStep: number;
  totalSteps: number;
  scheduleData: WizardData;
  isLoading: boolean;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateScheduleData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultWizardData: WizardData = {
  creationMode: 'ai',
  selectedPlatforms: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'discord', 'telegram'],
  platformConfigs: {},
  platformStates: {},
  scheduleConfig: { type: 'daily' },
  links: {},
};

const ScheduleWizardContext = createContext<ScheduleWizardContextType | undefined>(undefined);

export function ScheduleWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData);
  const [isLoading, setIsLoading] = useState(false);
  
  const totalSteps = 7;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const setStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const updateScheduleData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData(defaultWizardData);
    setIsLoading(false);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <ScheduleWizardContext.Provider
      value={{
        currentStep,
        totalSteps,
        scheduleData: wizardData,
        isLoading,
        nextStep,
        prevStep,
        setStep,
        updateScheduleData,
        resetWizard,
        setLoading,
      }}
    >
      {children}
    </ScheduleWizardContext.Provider>
  );
}

export function useScheduleWizard() {
  const context = useContext(ScheduleWizardContext);
  if (context === undefined) {
    throw new Error('useScheduleWizard must be used within a ScheduleWizardProvider');
  }
  return context;
}