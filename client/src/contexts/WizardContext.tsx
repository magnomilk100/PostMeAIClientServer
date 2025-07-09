import { createContext, useContext, useState, ReactNode } from 'react';

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  wizardData: any;
  isLoading: boolean;
  hideNavigation: boolean;
  selectedImages: any[];
  setSelectedImages: (images: any[]) => void;
  platformContent: any;
  setPlatformContent: (content: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateWizardData: (data: any) => void;
  resetWizard: () => void;
  setLoading: (loading: boolean) => void;
  setHideNavigation: (hide: boolean) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children, totalSteps = 3 }: { children: ReactNode; totalSteps?: number }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hideNavigation, setHideNavigation] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [platformContent, setPlatformContent] = useState({});

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

  const updateWizardData = (data: any) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({});
    setIsLoading(false);
    setHideNavigation(false);
    setSelectedImages([]);
    setPlatformContent({});
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <WizardContext.Provider value={{
      currentStep,
      totalSteps,
      wizardData,
      isLoading,
      hideNavigation,
      selectedImages,
      setSelectedImages,
      platformContent,
      setPlatformContent,
      nextStep,
      prevStep,
      setStep,
      updateWizardData,
      resetWizard,
      setLoading,
      setHideNavigation
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}