import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizard } from "@/contexts/WizardContext";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";

interface PostWizardProps {
  children: React.ReactNode;
  onComplete?: () => void;
}

export function PostWizard({ children, onComplete }: PostWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep, isLoading, setLoading, hideNavigation } = useWizard();

  const handleNext = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    
    try {
      setLoading(true);
      
      // Validate current step before proceeding
      if (currentStep === 1) {
        const validateStep1 = (window as any).validateStep1;
        if (validateStep1) {
          const isValid = await validateStep1();
          if (!isValid) {
            setLoading(false);
            return; // Don't proceed if validation fails
          }
        }
      }
      
      // For AI wizard step 2, just move to next step
      if (currentStep === 2 && totalSteps === 4) {
        nextStep();
        setLoading(false);
        return;
      }
      
      // Handle publishing on step 2 (Manual Post) or step 3 (AI Post)
      if (currentStep === 2 && totalSteps === 3) {
        const publishFromStep2 = (window as any).publishFromStep2;
        if (publishFromStep2) {
          await publishFromStep2();
          setLoading(false);
          return; // publishFromStep2 will handle moving to next step
        }
      }
      
      // Handle publishing or template saving on step 3 (AI Post)
      if (currentStep === 3 && totalSteps === 4) {
        const publishFromStep3 = (window as any).publishFromStep3;
        if (publishFromStep3) {
          await publishFromStep3();
          setLoading(false);
          return; // publishFromStep3 will handle moving to next step
        }
      }
      
      if (currentStep === totalSteps && onComplete) {
        onComplete();
      } else {
        nextStep();
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {currentStep === 1 ? 'Preparing your post...' : 'Publishing to all platforms...'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please wait, this may take a moment.
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <Card className="modern-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Your Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8">
                {Array.from({ length: totalSteps }, (_, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;
                  
                  return (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                          transition-all duration-300 ease-in-out
                          ${isActive && stepNumber === 4
                            ? 'bg-green-500 text-white shadow-lg scale-110'
                            : isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                            : isCompleted
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }
                        `}
                      >
                        {isCompleted || (isActive && stepNumber === 4) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          stepNumber
                        )}
                      </div>
                      <div className="ml-3 text-center">
                        <div className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          Step {stepNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {totalSteps === 3 
                            ? (stepNumber === 1 ? 'Create Content' : stepNumber === 2 ? 'Select Platforms' : 'Publish & Success')
                            : (stepNumber === 1 ? 'AI Generation' : stepNumber === 2 ? 'Review Content' : stepNumber === 3 ? 'Select Platforms' : 'Success & Template')
                          }
                        </div>
                      </div>
                      {stepNumber < totalSteps && (
                        <div className={`w-16 h-0.5 mx-6 ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {currentStep} / {totalSteps}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <div className="transition-all duration-500 ease-in-out transform">
          {children}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 3 && currentStep !== 4 && !hideNavigation && (
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center space-x-2 px-6 py-3 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex-1 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalSteps === 3 
                  ? (currentStep === 1 ? 'Fill in your post details' : 
                     currentStep === 2 ? 'Choose your platforms' : 
                     'Review and publish')
                  : (currentStep === 1 ? 'Let AI generate content' : 
                     currentStep === 2 ? 'Review generated content' : 
                     currentStep === 3 ? 'Choose platforms and publish' : 
                     'Success and templates')
                }
              </span>
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStep === totalSteps || isLoading}
              className="flex items-center space-x-2 px-6 py-3 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {currentStep === 1 ? 'Preparing...' : 'Publishing...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {currentStep === totalSteps ? 'Complete' : 
                     (currentStep === 2 && totalSteps === 3) ? 'Publish to All Platforms NOW' :
                     (currentStep === 2 && totalSteps === 4) ? 'Satisfied, refine post for each social media platform' :
                     (currentStep === 3 && totalSteps === 4) ? 'Publish or Save Template' :
                     'Next'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}