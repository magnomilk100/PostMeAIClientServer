import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  ImageIcon, 
  Upload, 
  X, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Loader2,
  Check,
  Video,
  FileVideo
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MediaType {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  folder: string;
  binaryData: string;
  userId: string;
  createdAt: string;
}

// Type alias for backward compatibility
type ImageType = MediaType;

interface MediaManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: MediaType[];
  onImageSelect: (media: MediaType[]) => void;
  platformName: string;
}

export function MediaManagementModal({ 
  isOpen, 
  onClose, 
  selectedImages, 
  onImageSelect,
  platformName 
}: MediaManagementModalProps) {
  const queryClient = useQueryClient();
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['uncategorized']);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function to determine media type
  const getMediaType = (mimeType: string): 'image' | 'video' => {
    return mimeType.startsWith('video/') ? 'video' : 'image';
  };
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // Fetch images and folders
  const { data: images = [], isLoading: imagesLoading } = useQuery<ImageType[]>({
    queryKey: ['/api/images'],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: folders = [] } = useQuery<{ id: number; name: string; userId: string; createdAt: string }[]>({
    queryKey: ['/api/folders'],
    staleTime: 0,
    refetchOnMount: true,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      return res.json();
    },
    onSuccess: (newMedia) => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      onImageSelect([...selectedImages, newMedia]);
      const isVideo = newMedia.mimeType.startsWith('video/');
      toast({
        title: "Upload Successful",
        description: `${isVideo ? 'Video' : 'Image'} uploaded and added to selection`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  // AI Generate mutation
  const generateMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest('POST', '/api/ai/generate-image', { description });
    },
    onSuccess: (newImage) => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      onImageSelect([...selectedImages, newImage]);
      setAiDescription('');
      toast({
        title: "AI Image Generated",
        description: "Generated image added to selection",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only images or videos",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      
      if (isImage && file.size > maxImageSize) {
        toast({
          title: "File Too Large",
          description: "Images must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      if (isVideo && file.size > maxVideoSize) {
        toast({
          title: "File Too Large",
          description: "Videos must be smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      const formData = new FormData();
      formData.append('image', file);  // Keep 'image' for backend compatibility
      formData.append('folder', 'uncategorized');
      formData.append('originalName', file.name);
      uploadMutation.mutate(formData);
    });
  };

  const handleAIGenerate = () => {
    if (!aiDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for the AI image",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateMutation.mutate(aiDescription, {
      onSettled: () => setIsGenerating(false),
    });
  };

  const toggleImageSelection = (image: ImageType) => {
    const isSelected = selectedImages.some(img => img.id === image.id);
    if (isSelected) {
      onImageSelect(selectedImages.filter(img => img.id !== image.id));
    } else {
      onImageSelect([...selectedImages, image]);
    }
  };

  const removeSelectedImage = (imageId: number) => {
    onImageSelect(selectedImages.filter(img => img.id !== imageId));
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    );
  };

  // Group images by folder
  const groupedImages = images.reduce((acc, image) => {
    const folder = image.folder || 'uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(image);
    return acc;
  }, {} as Record<string, ImageType[]>);

  // Get all folder names
  const allFolders = [...new Set([
    'uncategorized',
    ...folders.map(f => f.name),
    ...Object.keys(groupedImages)
  ])];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Media Management - {platformName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs defaultValue="library" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col min-h-0">
              <TabsContent value="library" className="flex-1 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-4">
                    {imagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      allFolders.map(folderName => {
                        const folderImages = groupedImages[folderName] || [];
                        const isExpanded = expandedFolders.includes(folderName);
                        
                        return (
                          <div key={folderName} className="space-y-2">
                            <button
                              onClick={() => toggleFolder(folderName)}
                              className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <FolderOpen className="h-4 w-4" />
                              <span className="font-medium">{folderName}</span>
                              <Badge variant="secondary" className="ml-auto">
                                {folderImages.length}
                              </Badge>
                            </button>
                            
                            {isExpanded && (
                              <div className="grid grid-cols-4 gap-3 ml-6">
                                {folderImages.map(image => {
                                  const isSelected = selectedImages.some(img => img.id === image.id);
                                  return (
                                    <div
                                      key={image.id}
                                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                                        isSelected 
                                          ? 'ring-2 ring-purple-500 ring-offset-2' 
                                          : 'hover:ring-2 hover:ring-gray-300'
                                      }`}
                                      onClick={() => toggleImageSelection(image)}
                                    >
                                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                                        {getMediaType(image.mimeType) === 'video' ? (
                                          <>
                                            <video
                                              src={`data:${image.mimeType};base64,${image.binaryData}`}
                                              className="w-full h-full object-cover"
                                              muted
                                              loop
                                              preload="metadata"
                                            />
                                            <Video className="absolute top-2 right-2 h-4 w-4 text-white bg-black/50 rounded p-0.5" />
                                          </>
                                        ) : (
                                          <img
                                            src={`data:${image.mimeType};base64,${image.binaryData}`}
                                            alt={image.originalName}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                      
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                          <Check className="h-6 w-6 text-purple-600" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="upload" className="flex-1 flex flex-col">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Media
                      </CardTitle>
                      <CardDescription>
                        Upload images and videos from your device to add to your library
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="file-upload">Choose Files</Label>
                          <Input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleFileUpload(files);
                            }}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div>Images: JPG, PNG, GIF, WEBP (Max 5MB each)</div>
                          <div>Videos: MP4, WEBM, MOV (Max 50MB each)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-generate" className="flex-1 flex flex-col">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Image Generation
                      </CardTitle>
                      <CardDescription>
                        Generate custom images using AI based on your description
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ai-description">Image Description</Label>
                          <Textarea
                            id="ai-description"
                            placeholder="Describe the image you want to generate..."
                            value={aiDescription}
                            onChange={(e) => setAiDescription(e.target.value)}
                            className="mt-2"
                            rows={4}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleAIGenerate}
                          disabled={isGenerating || !aiDescription.trim()}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Image
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Selected Media Section */}
          <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Selected Media ({selectedImages.length})
            </h3>
            
            {selectedImages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No media selected. Choose images or videos from the tabs above.
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {selectedImages.map(media => (
                  <div key={media.id} className="relative group">
                    <div className="aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                      {getMediaType(media.mimeType) === 'video' ? (
                        <>
                          <video
                            src={`data:${media.mimeType};base64,${media.binaryData}`}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <Video className="absolute top-1 right-1 h-3 w-3 text-white bg-black/50 rounded p-0.5" />
                        </>
                      ) : (
                        <img
                          src={`data:${media.mimeType};base64,${media.binaryData}`}
                          alt={media.originalName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeSelectedImage(media.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 p-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Add Selected Media ({selectedImages.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}