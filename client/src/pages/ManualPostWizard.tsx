import { WizardProvider, useWizard } from "@/contexts/WizardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import ManualPostStep1 from "@/components/wizard-steps/ManualPostStep1";
import ManualPostStep3 from "@/components/wizard-steps/ManualPostStep3";
import ManualPostStep4 from "@/components/wizard-steps/ManualPostStep4";
import ManualPostStep5 from "@/components/wizard-steps/ManualPostStep5";
import ManualPostStep6 from "@/components/wizard-steps/ManualPostStep6";
import ManualPostStep7 from "@/components/wizard-steps/ManualPostStep7";

function WizardContent() {
  const { currentStep, totalSteps, nextStep, prevStep, isLoading, wizardData } = useWizard();
  const { toast } = useToast();

  const stepTitles = [
    "Post Content",
    "Image and Video Manipulation",
    "Links",
    "Schedule Configuration",
    "Schedule Summary",
    "Final Step: Schedule Name"
  ];

  const validateScheduleConfiguration = () => {
    const { scheduleConfig } = wizardData;
    
    if (!scheduleConfig) return false;
    
    // Check if at least one schedule is configured
    const hasDaily = scheduleConfig.daily && scheduleConfig.daily.length > 0;
    const hasWeekly = scheduleConfig.weekly && scheduleConfig.weekly.length > 0;
    const hasMonthly = scheduleConfig.monthly && scheduleConfig.monthly.length > 0;
    const hasCalendar = scheduleConfig.calendar && scheduleConfig.calendar.length > 0;
    
    return hasDaily || hasWeekly || hasMonthly || hasCalendar;
  };

  const handleNext = () => {
    // Validate Step 1 - Post Content
    if (currentStep === 1) {
      const step1Data = wizardData.step1Data || {};
      if (!step1Data.title || step1Data.title.trim().length === 0) {
        toast({
          title: "Title Required",
          description: "Please enter a title for your post before proceeding.",
          variant: "destructive",
        });
        return;
      }
      if (!step1Data.content || step1Data.content.trim().length === 0) {
        toast({
          title: "Content Required", 
          description: "Please enter content for your post before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate Step 4 - Schedule configuration (was Step 5)
    if (currentStep === 4) {
      if (!validateScheduleConfiguration()) {
        toast({
          title: "Schedule Required",
          description: "Please configure at least one schedule (Daily, Weekly, Monthly, or Calendar) before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }
    
    nextStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ManualPostStep1 />;
      case 2:
        return <ManualPostStep3 />;
      case 3:
        return <ManualPostStep4 />;
      case 4:
        return <ManualPostStep5 />;
      case 5:
        return <ManualPostStep6 />;
      case 6:
        return <ManualPostStep7 />;
      default:
        return <ManualPostStep1 />;
    }
  };

  return (
      <div className="page-content-full">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-4xl font-bold text-standard mb-2">Create Manual Post</h1>
          <p className="text-muted">Create and schedule your social media content manually</p>
        </div>

        {/* Progress */}
        <Card className="modern-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-standard">
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
              </h2>
              <span className="text-sm text-muted">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </CardHeader>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step < currentStep
                      ? "bg-green-500 text-white"
                      : step === currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < totalSteps && (
                  <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="modern-card mb-8">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < totalSteps && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
  );
}

export default function ManualPostWizard() {
  return (
    <WizardProvider totalSteps={6}>
      <WizardContent />
    </WizardProvider>
  );
}