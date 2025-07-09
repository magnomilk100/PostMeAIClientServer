import { Card, CardContent } from "@/components/ui/card";
import { Bot, Lightbulb } from "lucide-react";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";

export default function ScheduleStep1() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();

  // Auto-set AI mode when component loads
  if (!scheduleData.creationMode) {
    updateScheduleData({ creationMode: 'ai' });
  }



  return (
    <div className="space-y-8">
      {/* Simple placeholder step */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
            <Bot className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Post Creation
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Ready to create AI-powered social media content? Let's get started with your automated posting schedule.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Lightbulb className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
          <p className="text-purple-100 mb-4">
            Click "Next" to begin creating your AI-powered social media schedule. 
            The process takes just a few minutes to set up automated posting that works 24/7.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}