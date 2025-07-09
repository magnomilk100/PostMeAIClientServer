import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWizard } from "@/contexts/WizardContext";
import { MediaManagementModal } from "@/components/MediaManagementModal";
import { type Image as ImageType } from "@shared/schema";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import {
  ImageIcon,
  Plus,
  X,
  Hash,
  Type,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Calendar,
  Eye,
  GripVertical,
  Upload,
  Sparkles,
  CheckCircle,
  XCircle,
  Target,
  Settings
} from "lucide-react";

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ManualPostStep3Enhanced() {
  const { toast } = useToast();
  const { 
    selectedImages, 
    setSelectedImages, 
    platformContent, 
    setPlatformContent,
    updateWizardData,
    wizardData 
  } = useWizard();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [currentPlatformImages, setCurrentPlatformImages] = useState<ImageType[]>([]);
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: 'image' | 'video', index: number, platformId: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<ImageType | null>(null);

  // Fetch social media configurations to check connection status
  const { data: socialMediaConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['/api/social-media-configs'],
    enabled: true
  });

  // Helper function to check if platform is connected
  const isPlatformConnected = (platformId: string) => {
    if (!socialMediaConfigs || !Array.isArray(socialMediaConfigs)) return false;
    const config = socialMediaConfigs.find((config: any) => config.platformId === platformId);
    return config && config.testStatus === 'connected';
  };

  // Function to open video modal
  const openVideoModal = (video: ImageType) => {
    setCurrentVideo(video);
    setVideoModalOpen(true);
  };

  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: SiFacebook,
      color: "#1877F2",
      bgClass: "bg-blue-600",
      lightBg: 'bg-blue-50 dark:bg-blue-950/20',
      description: "Share posts, images, and engage with your audience",
      limits: { title: 120, content: 63206, hashtags: 30, media: 10 }
    },
    {
      id: "instagram",
      name: "Instagram", 
      icon: SiInstagram,
      color: "#E4405F",
      bgClass: "bg-gradient-to-r from-purple-500 to-pink-500",
      lightBg: 'bg-pink-50 dark:bg-pink-950/20',
      description: "Post photos, stories, and reels to your profile",
      limits: { title: 0, content: 2200, hashtags: 30, media: 10 }
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: SiLinkedin,
      color: "#0A66C2",
      bgClass: "bg-blue-700",
      lightBg: 'bg-blue-50 dark:bg-blue-950/20',
      description: "Share professional content and network updates",
      limits: { title: 150, content: 3000, hashtags: 15, media: 9 }
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: SiTiktok,
      color: "#000000",
      bgClass: "bg-black",
      lightBg: 'bg-gray-50 dark:bg-gray-950/20',
      description: "Create and share short-form video content",
      limits: { title: 0, content: 2200, hashtags: 100, media: 1 }
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: SiYoutube,
      color: "#FF0000",
      bgClass: "bg-red-600",
      lightBg: 'bg-red-50 dark:bg-red-950/20',
      description: "Upload videos and manage your channel",
      limits: { title: 100, content: 5000, hashtags: 15, media: 1 }
    },
    {
      id: "discord",
      name: "Discord",
      icon: SiDiscord,
      color: "#5865F2",
      bgClass: "bg-indigo-600",
      lightBg: 'bg-indigo-50 dark:bg-indigo-950/20',
      description: "Share content in servers and communities",
      limits: { title: 0, content: 2000, hashtags: 0, media: 10 }
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: SiTelegram,
      color: "#26A5E4",
      bgClass: "bg-sky-600",
      lightBg: 'bg-sky-50 dark:bg-sky-950/20',
      description: "Send messages and media to channels",
      limits: { title: 0, content: 4096, hashtags: 0, media: 10 }
    },
  ];

  // Create sorted platforms array that updates when platformContent changes
  const sortedPlatforms = useMemo(() => {
    if (!platformContent) return platforms;
    
    return [...platforms].sort((a, b) => {
      const contentA = platformContent[a.id] || { active: true };
      const contentB = platformContent[b.id] || { active: true };
      
      // Sort by active status: active platforms first (true > false)
      if (contentA.active === contentB.active) return 0;
      if (contentA.active && !contentB.active) return -1;
      if (!contentA.active && contentB.active) return 1;
      return 0;
    });
  }, [platformContent]);

  // Initialize platform content
  useEffect(() => {
    if (!platformContent || Object.keys(platformContent).length === 0) {
      // Check for existing platform content in wizard context
      const existingPlatformContent = wizardData.step3PlatformContent;
      
      const initialPlatformContent = platforms.reduce((acc, platform) => {
        const existingContent = existingPlatformContent?.[platform.id];
        acc[platform.id] = {
          title: existingContent?.title || '',
          content: existingContent?.content || '',
          hashtags: existingContent?.hashtags || '',
          images: existingContent?.images || [],
          videos: existingContent?.videos || [],
          active: existingContent?.active !== undefined ? existingContent.active : isPlatformConnected(platform.id), // Restore saved state or default to connected status
          imageIncluded: existingContent?.imageIncluded || {}
        };
        return acc;
      }, {} as any);
      
      setPlatformContent(initialPlatformContent);
    }
  }, [platformContent, setPlatformContent, socialMediaConfigs, wizardData.step3PlatformContent]);

  const updatePlatformTextContent = (platformId: string, field: string, value: string) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [field]: value
        }
      };
      
      // Save updated platform content to wizard context for persistence
      updateWizardData({ 
        step3PlatformContent: updated
      });
      
      return updated;
    });
  };

  const togglePlatformActive = (platformId: string) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          active: !prev[platformId].active
        }
      };
      
      // Save updated platform content to wizard context for persistence
      updateWizardData({ 
        step3PlatformContent: updated
      });
      
      return updated;
    });
  };

  const removeMediaItem = (platformId: string, type: 'images' | 'videos', index: number) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      const newItems = prev[platformId][type].filter((_, i) => i !== index);
      return {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [type]: newItems
        }
      };
    });
  };

  const handleDragStart = (e: React.DragEvent, platformId: string, type: 'image' | 'video', index: number) => {
    setDraggedItem({ type, index, platformId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, platformId: string, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem || draggedItem.platformId !== platformId) {
      setDraggedItem(null);
      return;
    }

    const { index: sourceIndex, type } = draggedItem;
    
    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      return;
    }

    setPlatformContent(prev => {
      if (!prev) return prev;
      
      const items = [...prev[platformId][type === 'image' ? 'images' : 'videos']];
      const [movedItem] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, movedItem);
      
      return {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [type === 'image' ? 'images' : 'videos']: items
        }
      };
    });

    setDraggedItem(null);
    toast({
      title: "Media Reordered",
      description: `${type === 'image' ? 'Image' : 'Video'} moved successfully`,
    });
  };

  const openMediaModal = (platformId: string) => {
    setCurrentPlatform(platformId);
    setCurrentPlatformImages(platformContent?.[platformId]?.images || []);
    setModalOpen(true);
  };

  const handleModalImageSelect = (images: ImageType[]) => {
    setCurrentPlatformImages(images);
    setPlatformContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [currentPlatform]: {
          ...prev[currentPlatform],
          images: images
        }
      };
    });
  };

  // Accordion control functions
  const expandAllPlatforms = () => {
    setExpandedPlatforms(platforms.map(p => p.id));
  };

  const collapseAllPlatforms = () => {
    setExpandedPlatforms([]);
  };

  // Media reordering functions
  const reorderMedia = (platformId: string, type: 'images' | 'videos', fromIndex: number, toIndex: number) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      const items = [...prev[platformId][type]];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      
      return {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [type]: items
        }
      };
    });
  };

  // Duplicate media to all platforms
  const duplicateToAllPlatforms = (mediaItem: ImageType, type: 'images' | 'videos') => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      platforms.forEach(platform => {
        if (updated[platform.id]) {
          const currentMedia = updated[platform.id][type] || [];
          const mediaExists = currentMedia.some(item => item.id === mediaItem.id);
          
          if (!mediaExists && currentMedia.length < platform.limits.media) {
            updated[platform.id] = {
              ...updated[platform.id],
              [type]: [...currentMedia, mediaItem]
            };
          }
        }
      });
      
      return updated;
    });
    
    toast({
      title: "Media duplicated",
      description: `${type === 'images' ? 'Image' : 'Video'} has been added to all compatible platforms.`,
    });
  };

  // Function to toggle all platforms active/inactive
  const toggleAllPlatforms = () => {
    if (!platformContent) return;
    
    // Check if all platforms are currently active
    const allPlatformsActive = platforms.every(platform => 
      platformContent[platform.id]?.active !== false
    );
    
    // Set all platforms to the opposite state
    const newState = !allPlatformsActive;
    
    setPlatformContent(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      platforms.forEach(platform => {
        if (updated[platform.id]) {
          updated[platform.id] = {
            ...updated[platform.id],
            active: newState
          };
        }
      });
      
      // Save updated platform content to wizard context for persistence
      updateWizardData({ 
        step3PlatformContent: updated
      });
      
      return updated;
    });
    
    toast({
      title: newState ? "All platforms activated" : "All platforms deactivated",
      description: `All social media platforms are now ${newState ? 'active' : 'inactive'}`,
    });
  };

  // Character count validation
  const getCharacterCount = (text: string) => text.length;
  
  const isOverLimit = (text: string, limit: number) => limit > 0 && text.length > limit;

  // Hashtag processing
  const processHashtags = (hashtags: string): string[] => {
    return hashtags
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 space-y-4">
      {/* Social Media Platforms Header - Card Style */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Target className="h-5 w-5 text-blue-600" />
            Social Media Platforms
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Select the social media platforms where you want to publish your content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Horizontal Platform Icons Display */}
          <div className="flex items-center justify-center gap-6 py-2">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: platform.color }}
              >
                <platform.icon className="w-6 h-6 text-white" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configure Post Header - Card Style with All Content */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Settings className="h-5 w-5 text-purple-600" />
            Configure Post for Each Platform
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Customize content, media, and settings for each social media platform with precision.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Global Accordion Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={expandAllPlatforms}
              className="flex items-center gap-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={collapseAllPlatforms}
              className="flex items-center gap-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
            >
              <ChevronUp className="w-4 h-4" />
              Collapse All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleAllPlatforms}
              className="flex items-center gap-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-900/20"
            >
              <Settings className="w-4 h-4" />
              {platformContent && platforms.every(platform => platformContent[platform.id]?.active !== false) 
                ? "Deactivate All" 
                : "Activate All"
              }
            </Button>
          </div>

          <div className="space-y-4">
            {platformContent && (
            <Accordion 
              type="multiple" 
              value={expandedPlatforms}
              onValueChange={setExpandedPlatforms}
              className="space-y-4"
              key={Object.keys(platformContent || {}).map(id => `${id}-${platformContent[id]?.active}`).join(',')}
            >
              {sortedPlatforms.map((platform) => {
                const content = platformContent[platform.id] || {
                  title: '',
                  content: '',
                  hashtags: '',
                  images: [],
                  videos: [],
                  active: true,
                  imageIncluded: {}
                };

                const isConnected = isPlatformConnected(platform.id);

                return (
                  <AccordionItem 
                    key={platform.id} 
                    value={platform.id} 
                    className={`border rounded-lg transition-all duration-200 border-l-4 ${
                      content.active 
                        ? `${platform.lightBg} border-l-[${platform.color}]` 
                        : 'opacity-60 bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700 border-l-gray-400'
                    }`}
                    style={{
                      borderLeftColor: content.active ? platform.color : '#9ca3af'
                    }}
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                            content.active 
                              ? platform.bgClass 
                              : 'bg-gray-400 dark:bg-gray-600'
                          }`}>
                            <platform.icon className={`h-6 w-6 transition-all duration-200 ${
                              content.active ? 'text-white' : 'text-gray-200'
                            }`} />
                          </div>
                          <div className="text-left">
                            <h3 className={`font-semibold text-lg transition-all duration-200 ${
                              content.active ? 'text-foreground' : 'text-gray-500 dark:text-gray-400'
                            }`}>{platform.name}</h3>
                            <p className={`text-sm transition-all duration-200 ${
                              content.active ? 'text-muted' : 'text-gray-400 dark:text-gray-500'
                            }`}>{platform.description}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Max: {platform.limits.title > 0 ? `${platform.limits.title} title, ` : ''}
                              {platform.limits.content} content, {platform.limits.media} media
                            </p>
                            {!configsLoading && (
                              <div className="flex items-center gap-1 mt-1">
                                {isPlatformConnected(platform.id) ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs">Connected</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-xs">Not Connected - Configure in Social Media page</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={content.active ? "default" : "secondary"}
                            className={`transition-all duration-200 ${
                              content.active 
                                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {content.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={content.active}
                              onCheckedChange={() => togglePlatformActive(platform.id)}
                              className={`transition-all duration-200 ${
                                content.active ? 'data-[state=checked]:bg-green-500' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className={`px-6 pb-6 transition-all duration-200 ${
                      content.active ? '' : 'opacity-60'
                    }`}>
                      <div className="space-y-6">
                        {/* Content Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${platform.id}`} className="flex items-center gap-2">
                              <Type className="h-4 w-4" />
                              Title
                              {platform.limits.title > 0 && (
                                <Badge variant="outline" className="ml-2">
                                  {getCharacterCount(content.title)}/{platform.limits.title}
                                </Badge>
                              )}
                            </Label>
                            <Input
                              id={`title-${platform.id}`}
                              placeholder={content.active ? "Enter post title..." : "Platform inactive - enable to edit"}
                              value={content.title}
                              onChange={(e) => updatePlatformTextContent(platform.id, 'title', e.target.value)}
                              className={`mt-1 ${isOverLimit(content.title, platform.limits.title) ? 'border-red-500' : ''}`}
                              disabled={!content.active}
                            />
                            {isOverLimit(content.title, platform.limits.title) && (
                              <p className="text-red-500 text-xs mt-1">
                                Title exceeds {platform.limits.title} character limit
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor={`hashtags-${platform.id}`} className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Hashtags
                              {platform.limits.hashtags > 0 && (
                                <Badge variant="outline" className="ml-2">
                                  {processHashtags(content.hashtags).length}/{platform.limits.hashtags}
                                </Badge>
                              )}
                            </Label>
                            <Input
                              id={`hashtags-${platform.id}`}
                              placeholder={content.active ? "#hashtag1 #hashtag2" : "Platform inactive - enable to edit"}
                              value={content.hashtags}
                              onChange={(e) => updatePlatformTextContent(platform.id, 'hashtags', e.target.value)}
                              className="mt-1"
                              disabled={!content.active}
                            />
                            {processHashtags(content.hashtags).length > platform.limits.hashtags && platform.limits.hashtags > 0 && (
                              <p className="text-red-500 text-xs mt-1">
                                Too many hashtags (max {platform.limits.hashtags})
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`content-${platform.id}`} className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Content
                            <Badge variant="outline" className="ml-2">
                              {getCharacterCount(content.content)}/{platform.limits.content}
                            </Badge>
                          </Label>
                          <Textarea
                            id={`content-${platform.id}`}
                            placeholder={content.active ? "Write your post content..." : "Platform inactive - enable to edit"}
                            value={content.content}
                            onChange={(e) => updatePlatformTextContent(platform.id, 'content', e.target.value)}
                            className={`mt-1 ${isOverLimit(content.content, platform.limits.content) ? 'border-red-500' : ''}`}
                            rows={4}
                            disabled={!content.active}
                          />
                          {isOverLimit(content.content, platform.limits.content) && (
                            <p className="text-red-500 text-xs mt-1">
                              Content exceeds {platform.limits.content} character limit
                            </p>
                          )}
                        </div>

                        {/* Enhanced Media Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Media ({content.images.length}/{platform.limits.media})
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMediaModal(platform.id)}
                                className="flex items-center gap-2"
                                disabled={!content.active}
                              >
                                <Plus className="h-4 w-4" />
                                {content.active ? "Add Media" : "Platform Inactive"}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Display Selected Images with Reordering */}
                          {content.images.length > 0 ? (
                            <div className="space-y-3">
                              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <GripVertical className="h-4 w-4" />
                                Publication order (drag to reorder)
                              </div>
                              {content.images.map((image, index) => (
                                <div 
                                  key={index} 
                                  className={`relative group flex items-center gap-4 p-3 border rounded-lg transition-all duration-200 ${
                                    dragOverIndex === index 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105' 
                                      : draggedItem?.platformId === platform.id && draggedItem?.index === index
                                      ? 'opacity-50 transform rotate-2'
                                      : 'bg-gray-50 dark:bg-gray-800/50'
                                  }`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, platform.id, 'image', index)}
                                  onDragOver={(e) => handleDragOver(e, index)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, platform.id, index)}
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs">
                                      {index + 1}
                                    </span>
                                    <GripVertical className="h-4 w-4 cursor-move" />
                                  </div>
                                  
                                  <div className="w-64 h-64 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                                    {image.mimeType.startsWith('video/') ? (
                                      <div 
                                        className="w-full h-full cursor-pointer relative group"
                                        onClick={() => openVideoModal(image)}
                                      >
                                        <video
                                          src={`data:${image.mimeType};base64,${image.binaryData}`}
                                          className="w-full h-full object-cover"
                                          muted
                                          loop
                                          preload="metadata"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 text-white text-xs">
                                          VIDEO
                                        </div>
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="bg-white/90 rounded-full p-3">
                                            <Video className="h-8 w-8 text-black" />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={`data:${image.mimeType};base64,${image.binaryData}`}
                                        alt={image.originalName}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate" title={image.originalName}>
                                      {image.originalName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {image.mimeType} • {formatFileSize(image.fileSize)}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => duplicateToAllPlatforms(image, 'images')}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Duplicate to all platforms"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeMediaItem(platform.id, 'images', index)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                No media selected. Click "Add Media" to get started.
                              </p>
                            </div>
                          )}


                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Management Modal */}
      <MediaManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedImages={currentPlatformImages}
        onImageSelect={handleModalImageSelect}
        platformName={platforms.find(p => p.id === currentPlatform)?.name || ''}
      />

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {currentVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={`data:${currentVideo.mimeType};base64,${currentVideo.binaryData}`}
                className="w-full h-full object-contain"
                controls
                autoPlay
                muted
              />
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>{currentVideo?.originalName}</span>
            <span>{currentVideo && formatFileSize(currentVideo.fileSize)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}