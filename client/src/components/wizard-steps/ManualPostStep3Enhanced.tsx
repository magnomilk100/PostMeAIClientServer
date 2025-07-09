import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Sparkles
} from "lucide-react";

export default function ManualPostStep3Enhanced() {
  const { toast } = useToast();
  const { 
    selectedImages, 
    setSelectedImages, 
    platformContent, 
    setPlatformContent,
    updateWizardData 
  } = useWizard();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [currentPlatformImages, setCurrentPlatformImages] = useState<ImageType[]>([]);
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: 'image' | 'video', index: number } | null>(null);

  const platforms = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: SiFacebook, 
      color: '#1877F2',
      limits: { title: 120, content: 63206, hashtags: 30, media: 10 }
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: SiInstagram, 
      color: '#E4405F',
      limits: { title: 0, content: 2200, hashtags: 30, media: 10 }
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: SiLinkedin, 
      color: '#0A66C2',
      limits: { title: 150, content: 3000, hashtags: 15, media: 9 }
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: SiTiktok, 
      color: '#000000',
      limits: { title: 0, content: 2200, hashtags: 100, media: 1 }
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: SiYoutube, 
      color: '#FF0000',
      limits: { title: 100, content: 5000, hashtags: 15, media: 1 }
    },
    { 
      id: 'discord', 
      name: 'Discord', 
      icon: SiDiscord, 
      color: '#5865F2',
      limits: { title: 0, content: 2000, hashtags: 0, media: 10 }
    },
    { 
      id: 'telegram', 
      name: 'Telegram', 
      icon: SiTelegram, 
      color: '#26A5E4',
      limits: { title: 0, content: 4096, hashtags: 0, media: 10 }
    },
  ];

  // Initialize platform content
  useEffect(() => {
    if (!platformContent || Object.keys(platformContent).length === 0) {
      const initialPlatformContent = platforms.reduce((acc, platform) => {
        acc[platform.id] = {
          title: '',
          content: '',
          hashtags: '',
          images: [],
          videos: [],
          active: true,
          imageIncluded: {}
        };
        return acc;
      }, {} as any);
      
      setPlatformContent(initialPlatformContent);
    }
  }, [platformContent, setPlatformContent]);

  const updatePlatformTextContent = (platformId: string, field: string, value: string) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [field]: value
        }
      };
    });
  };

  const togglePlatformActive = (platformId: string) => {
    setPlatformContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [platformId]: {
          ...prev[platformId],
          active: !prev[platformId].active
        }
      };
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
    <div className="page-content">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
          Configure Post for Each Platform
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Customize content, media, and settings for each social media platform with precision
        </p>
      </div>

      {/* Global Accordion Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={expandAllPlatforms}
          className="flex items-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          Expand All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={collapseAllPlatforms}
          className="flex items-center gap-2"
        >
          <ChevronUp className="w-4 h-4" />
          Collapse All
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4">
          {platformContent && (
            <Accordion 
              type="multiple" 
              value={expandedPlatforms}
              onValueChange={setExpandedPlatforms}
              className="space-y-4"
            >
              {platforms.map((platform) => {
                const content = platformContent[platform.id] || {
                  title: '',
                  content: '',
                  hashtags: '',
                  images: [],
                  videos: [],
                  active: true,
                  imageIncluded: {}
                };

                return (
                  <AccordionItem key={platform.id} value={platform.id} className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${platform.color}20` }}
                          >
                            <platform.icon 
                              className="h-6 w-6" 
                              style={{ color: platform.color }}
                            />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-lg">{platform.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Max: {platform.limits.title > 0 ? `${platform.limits.title} title, ` : ''}
                              {platform.limits.content} content, {platform.limits.media} media
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge variant={content.active ? "default" : "secondary"}>
                            {content.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch
                            checked={content.active}
                            onCheckedChange={() => togglePlatformActive(platform.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-6">
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
                              placeholder="Enter post title..."
                              value={content.title}
                              onChange={(e) => updatePlatformTextContent(platform.id, 'title', e.target.value)}
                              className={`mt-1 ${isOverLimit(content.title, platform.limits.title) ? 'border-red-500' : ''}`}
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
                              placeholder="#hashtag1 #hashtag2"
                              value={content.hashtags}
                              onChange={(e) => updatePlatformTextContent(platform.id, 'hashtags', e.target.value)}
                              className="mt-1"
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
                            placeholder="Write your post content..."
                            value={content.content}
                            onChange={(e) => updatePlatformTextContent(platform.id, 'content', e.target.value)}
                            className={`mt-1 ${isOverLimit(content.content, platform.limits.content) ? 'border-red-500' : ''}`}
                            rows={4}
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
                              >
                                <Plus className="h-4 w-4" />
                                Add Media
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
                                <div key={index} className="relative group flex items-center gap-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs">
                                      {index + 1}
                                    </span>
                                    <GripVertical className="h-4 w-4 cursor-move" />
                                  </div>
                                  
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                    <img
                                      src={`data:${image.mimeType};base64,${image.binaryData}`}
                                      alt={image.originalName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate" title={image.originalName}>
                                      {image.originalName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {image.mimeType} • {(image.fileSize / 1024).toFixed(1)}KB
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

                          {/* Platform Preview */}
                          {(content.title || content.content || content.images.length > 0) && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="h-4 w-4" />
                                <span className="text-sm font-medium">Preview</span>
                              </div>
                              <div className="space-y-2">
                                {content.title && (
                                  <h4 className="font-semibold">{content.title}</h4>
                                )}
                                {content.content && (
                                  <p className="text-sm">{content.content}</p>
                                )}
                                {processHashtags(content.hashtags).length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {processHashtags(content.hashtags).map((tag, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {content.images.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {content.images.slice(0, 2).map((image, i) => (
                                      <div key={i} className="aspect-video rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <img
                                          src={`data:${image.mimeType};base64,${image.binaryData}`}
                                          alt={image.originalName}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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
      </ScrollArea>

      {/* Media Management Modal */}
      <MediaManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedImages={currentPlatformImages}
        onImageSelect={handleModalImageSelect}
        platformName={platforms.find(p => p.id === currentPlatform)?.name || ''}
      />
    </div>
  );
}