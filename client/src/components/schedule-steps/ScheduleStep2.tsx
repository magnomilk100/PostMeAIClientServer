import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { Bot, Globe, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" }
];

export default function ScheduleStep2() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const subjectRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on subject field when component mounts
  useEffect(() => {
    if (subjectRef.current) {
      subjectRef.current.focus();
    }
  }, []);

  const handleSubjectChange = (value: string) => {
    updateScheduleData({
      aiContent: {
        ...scheduleData.aiContent,
        subject: value,
        language: scheduleData.aiContent?.language || "en"
      }
    });
  };

  const handleLanguageChange = (value: string) => {
    updateScheduleData({
      aiContent: {
        ...scheduleData.aiContent,
        subject: scheduleData.aiContent?.subject || "",
        language: value
      }
    });
    setIsLanguageOpen(false);
  };

  const selectedLanguage = languages.find(lang => lang.code === (scheduleData.aiContent?.language || "en"));

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-standard">
          <Bot className="h-5 w-5 text-purple-600" />
          AI Content Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-xl font-medium">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Textarea
            ref={subjectRef}
            id="subject"
            placeholder="Describe what you want to post about... (minimum 10 characters)"
            value={scheduleData.aiContent?.subject || ""}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="text-lg min-h-[80px] resize-none"
            maxLength={400}
            rows={3}
            required
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Minimum 10 characters</span>
            <span>{scheduleData.aiContent?.subject?.length || 0}/400</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{selectedLanguage?.name || "Select language"}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            {isLanguageOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-lg">
                <div className="max-h-60 overflow-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}