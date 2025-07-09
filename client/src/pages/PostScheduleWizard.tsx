import { ScheduleWizardProvider, useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";


import ScheduleStep2 from "@/components/schedule-steps/ScheduleStep2";
import ScheduleStep4 from "@/components/schedule-steps/ScheduleStep4";
import ScheduleStep5 from "@/components/schedule-steps/ScheduleStep5";
import ScheduleStep6 from "@/components/schedule-steps/ScheduleStep6";
import ScheduleStep7 from "@/components/schedule-steps/ScheduleStep7";
import ScheduleStep8 from "@/components/schedule-steps/ScheduleStep8";
import ScheduleStep9 from "@/components/schedule-steps/ScheduleStep9";

function WizardContent() {
  const { currentStep, totalSteps, nextStep, prevStep, isLoading, scheduleData } = useScheduleWizard();
  const { toast } = useToast();

  const stepTitles = [
    "AI Content Generation",
    "Post Format & Style",
    "Links",
    "Review & Publish Options",
    "Schedule",
    "Summary",
    "Schedule Created"
  ];

  const validateScheduleConfiguration = () => {
    const { scheduleConfig } = scheduleData;
    
    if (!scheduleConfig) return false;
    
    // Check if at least one schedule is configured
    const hasDaily = scheduleConfig.daily && scheduleConfig.daily.length > 0;
    const hasWeekly = scheduleConfig.weekly && scheduleConfig.weekly.length > 0;
    const hasMonthly = scheduleConfig.monthly && scheduleConfig.monthly.length > 0;
    const hasCalendar = scheduleConfig.calendar && scheduleConfig.calendar.length > 0;
    
    console.log('Schedule validation:', {
      hasDaily,
      hasWeekly,
      hasMonthly,
      hasCalendar,
      scheduleConfig
    });
    
    return hasDaily || hasWeekly || hasMonthly || hasCalendar;
  };

  const handleNext = () => {
    // Validate Step 1 - AI Content Generation (was Step 2)
    if (currentStep === 1) {
      const subject = scheduleData.aiContent?.subject || "";
      if (subject.length < 10) {
        toast({
          title: "Subject Required",
          description: "Please enter at least 10 characters in the subject field before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate Step 5 - Schedule configuration (was Step 6)
    if (currentStep === 5) {
      // Skip schedule validation if "Post immediately" is checked
      if (scheduleData.postImmediately) {
        console.log('Post immediately enabled - bypassing schedule validation');
      } else {
        if (!validateScheduleConfiguration()) {
          toast({
            title: "Schedule Required",
            description: "Please configure at least one schedule (Daily, Weekly, Monthly, or Calendar) before proceeding.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    nextStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ScheduleStep2 />;
      case 2:
        return <ScheduleStep4 />;
      case 3:
        return <ScheduleStep5 />;
      case 4:
        return <ScheduleStep6 />;
      case 5:
        return <ScheduleStep7 />;
      case 6:
        return <ScheduleStep8 />;
      case 7:
        return <ScheduleStep9 />;
      default:
        return <ScheduleStep2 />;
    }
  };

  return (

      <div className="page-content-full">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-4xl font-bold text-standard mb-2">Create Post Schedule</h1>
          <p className="text-muted">Set up automated posting across your social media platforms</p>
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
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Platforms Section - Only show on step 2 (Post Format & Style) */}
        {currentStep === 2 && (
          <Card className="modern-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-standard">
                <Zap className="h-5 w-5 text-purple-600" />
                Social Media Platforms
              </CardTitle>
              <p className="text-muted">
                Select the social media platforms where you want to publish your content
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <SiFacebook className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <SiInstagram className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                  <SiLinkedin className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <SiTiktok className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <SiYoutube className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <SiDiscord className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <SiTelegram className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Step Content */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep < totalSteps && (
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex justify-between">
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
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

  );
}

export default function PostScheduleWizard() {
  return (
    <ScheduleWizardProvider>
      <WizardContent />
    </ScheduleWizardProvider>
  );
}