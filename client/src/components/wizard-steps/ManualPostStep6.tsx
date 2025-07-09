import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "@/contexts/WizardContext";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Hash,
  ImageIcon,
  Globe,
  ExternalLink,
  Users,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    bgClass: "bg-blue-600"
  },
  {
    id: "instagram",
    name: "Instagram", 
    icon: SiInstagram,
    color: "#E4405F",
    bgClass: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
    bgClass: "bg-blue-700"
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    bgClass: "bg-black"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    bgClass: "bg-red-600"
  },
  {
    id: "discord",
    name: "Discord",
    icon: SiDiscord,
    color: "#5865F2",
    bgClass: "bg-indigo-600"
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "#26A5E4",
    bgClass: "bg-sky-500"
  }
];

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function ManualPostStep6() {
  const { wizardData } = useWizard();

  // Collect all schedules
  const schedules = [];
  
  // Daily schedules
  if (wizardData.scheduleConfig?.daily) {
    wizardData.scheduleConfig.daily.forEach((schedule) => {
      schedules.push({
        type: 'daily',
        description: `Every day at ${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`,
        frequency: 'Daily'
      });
    });
  }

  // Weekly schedules
  if (wizardData.scheduleConfig?.weekly) {
    wizardData.scheduleConfig.weekly.forEach((schedule) => {
      schedules.push({
        type: 'weekly',
        description: `Every ${daysOfWeek[schedule.day]} at ${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`,
        frequency: 'Weekly'
      });
    });
  }

  // Monthly schedules
  if (wizardData.scheduleConfig?.monthly) {
    wizardData.scheduleConfig.monthly.forEach((schedule) => {
      schedules.push({
        type: 'monthly',
        description: `Day ${schedule.day} of every month at ${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`,
        frequency: 'Monthly'
      });
    });
  }

  // Calendar schedules
  if (wizardData.scheduleConfig?.calendar) {
    wizardData.scheduleConfig.calendar.forEach((schedule) => {
      const date = new Date(schedule.date);
      schedules.push({
        type: 'calendar',
        description: `${date.toDateString()} at ${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`,
        frequency: 'One-time'
      });
    });
  }

  const selectedPlatforms = platforms.filter(p => wizardData.platforms?.includes(p.id)) || [];
  const postData = wizardData.step1Data || {};
  const selectedImages = wizardData.selectedImages || [];
  const links = wizardData.links || {};

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Schedule Summary</h2>
        <p className="text-muted">Review your post configuration and schedule details</p>
      </div>

      <div className="grid gap-6">
        {/* Post Content Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Post Content Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <h4 className="font-medium mb-2">Title:</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {postData.title || "No title provided"}
              </p>
            </div>

            {/* Content */}
            <div>
              <h4 className="font-medium mb-2">Content:</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg whitespace-pre-wrap">
                {postData.content || "No content provided"}
              </p>
            </div>

            {/* Hashtags */}
            {postData.hashtags && postData.hashtags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {postData.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
                      #{hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            <div>
              <h4 className="font-medium mb-2">Language:</h4>
              <Badge variant="outline">{postData.language || "en"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Target Platforms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Platforms ({selectedPlatforms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlatforms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    >
                      <div className={`w-8 h-8 rounded-lg ${platform.bgClass} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{platform.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>No platforms selected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images Summary */}
        {selectedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Selected Images ({selectedImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={`data:${image.mimeType};base64,${image.binaryData}`}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links Summary */}
        {(links.websiteLink || links.additionalLink1 || links.additionalLink2) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Links Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {links.websiteLink && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Website Link</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 break-all">{links.websiteLink}</p>
                  </div>
                </div>
              )}

              {links.additionalLink1 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-sm text-green-900 dark:text-green-100">Additional Link 1</p>
                    <p className="text-xs text-green-700 dark:text-green-300 break-all">{links.additionalLink1}</p>
                  </div>
                </div>
              )}

              {links.additionalLink2 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-sm text-purple-900 dark:text-purple-100">Additional Link 2</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 break-all">{links.additionalLink2}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Configuration ({schedules.length} schedules)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{schedule.description}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            schedule.type === 'daily' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            schedule.type === 'weekly' ? 'border-green-300 text-green-700 bg-green-50' :
                            schedule.type === 'monthly' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                            'border-orange-300 text-orange-700 bg-orange-50'
                          }`}
                        >
                          {schedule.frequency}
                        </Badge>
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No schedules configured</p>
                <p className="text-sm">Posts will be published immediately</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {selectedPlatforms.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Platforms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {selectedImages.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {Object.values(links).filter(link => link).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Links</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {schedules.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Schedules</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}