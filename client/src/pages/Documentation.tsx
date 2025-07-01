import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Calendar, TrendingUp, Zap, Image, Share2, Settings, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Documentation() {
  const { t } = useTranslation();
  return (
    <div className="page-content">
      <div>
        <h1 className="text-4xl font-bold text-standard mb-4">{t('documentation.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">{t('documentation.subtitle')}</p>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <span>{t('documentation.overview.title')}</span>
            </CardTitle>
            <CardDescription>
              {t('documentation.overview.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.overview.aiContent.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('documentation.overview.aiContent.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.overview.multiPlatform.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('documentation.overview.multiPlatform.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.overview.scheduling.title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('documentation.overview.scheduling.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Platforms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('documentation.platforms.title')}</CardTitle>
            <CardDescription>
              {t('documentation.platforms.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Facebook", color: "blue", descriptionKey: "facebook" },
                { name: "Instagram", color: "pink", descriptionKey: "instagram" },
                { name: "LinkedIn", color: "blue", descriptionKey: "linkedin" },
                { name: "TikTok", color: "black", descriptionKey: "tiktok" },
                { name: "YouTube", color: "red", descriptionKey: "youtube" },
                { name: "Discord", color: "indigo", descriptionKey: "discord" },
                { name: "Telegram", color: "blue", descriptionKey: "telegram" }
              ].map((platform) => (
                <div key={platform.name} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <Badge variant="outline" className={`mb-2 text-${platform.color}-600 dark:text-${platform.color}-400 border-${platform.color}-200 dark:border-${platform.color}-700`}>
                    {platform.name}
                  </Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{t(`documentation.platforms.${platform.descriptionKey}`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Post Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>{t('documentation.aiPost.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.aiPost.features')}</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <li key={index}>• {t(`documentation.aiPost.featuresList.${index}`)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.aiPost.workflow')}</h4>
                <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <li key={index}>{index + 1}. {t(`documentation.aiPost.workflowList.${index}`)}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Manual Post Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-primary" />
                <span>{t('documentation.manualPost.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.manualPost.features')}</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <li key={index}>• {t(`documentation.manualPost.featuresList.${index}`)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('documentation.manualPost.imageManagement')}</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {[0, 1, 2, 3].map((index) => (
                    <li key={index}>• {t(`documentation.manualPost.imageList.${index}`)}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>Template Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Features:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Save post configurations as reusable templates</li>
                  <li>• Automated scheduling (daily, weekly, monthly)</li>
                  <li>• Template execution and management</li>
                  <li>• Track creation and execution dates</li>
                  <li>• Active/inactive status control</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Scheduling Options:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">Daily</Badge> - Post every day at specified time</li>
                  <li>• <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">Weekly</Badge> - Post once per week</li>
                  <li>• <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">Monthly</Badge> - Post once per month</li>
                  <li>• Timezone support for accurate scheduling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Social Media Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">API Configuration:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Secure API key management</li>
                  <li>• Platform-specific connection setup</li>
                  <li>• Connection status monitoring</li>
                  <li>• Password protection with visibility toggle</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Setup Requirements:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Facebook: Facebook Developers App</li>
                  <li>• Instagram: Facebook Graph API</li>
                  <li>• LinkedIn: LinkedIn Developer Program</li>
                  <li>• TikTok: TikTok for Developers</li>
                  <li>• YouTube: Google Cloud Console</li>
                  <li>• Discord: Discord Developer Portal</li>
                  <li>• Telegram: BotFather Token</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Library */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="w-6 h-6 text-primary" />
              <span>Image Library Management</span>
            </CardTitle>
            <CardDescription>
              Organize and manage your images with a comprehensive library system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Organization Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Folder-based organization system</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Filter images by folder categories</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Create custom folders for projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Image metadata and details</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Management Actions:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Upload multiple images simultaneously</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Preview images in full-screen modal</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Delete images with confirmation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Hover actions for quick access</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to start creating and publishing content with PostMeAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Configure Social Media Accounts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Navigate to Social Media page and add your API keys for each platform you want to use.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Upload Images (Optional)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Go to Images page to upload and organize your visual content in folders.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Create Your First Post</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Choose between AI-powered or manual post creation from the Post page.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Review and Customize</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Review generated content and customize it for each platform before publishing.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                <div>
                  <h4 className="font-semibold mb-1">Publish or Schedule</h4>
                  <p className="text-sm text-gray-600">Publish immediately or save as a template for automated scheduling.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span>Best Practices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Content Creation:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Keep subjects clear and specific for better AI results</li>
                  <li>• Use appropriate text lengths for each platform</li>
                  <li>• Include relevant links to drive traffic</li>
                  <li>• Select high-quality images that match your content</li>
                  <li>• Review platform-specific variations before publishing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Scheduling & Templates:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Set up templates for consistent posting</li>
                  <li>• Consider optimal posting times for your audience</li>
                  <li>• Use review mode for important content</li>
                  <li>• Organize images in meaningful folder structures</li>
                  <li>• Monitor template performance and adjust as needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
