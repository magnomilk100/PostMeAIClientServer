import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, FolderPlus, Folder, Image as ImageIcon, Eye, Palette, Camera, Layers, HelpCircle, Move, Check, X, Video, Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Database image type from server
interface DBImage {
  id: number;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  folder: string | null;
  binaryData: string; // base64 encoded
  createdAt: string;
  updatedAt: string;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

// Helper to get data URL from base64
const getImageDataUrl = (base64: string, mimeType: string): string => {
  return `data:${mimeType};base64,${base64}`;
};

// Helper to check if file is a video
const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function Images() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [uploadFolder, setUploadFolder] = useState<string>("uncategorized");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedImage, setSelectedImage] = useState<DBImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string>("");


  // Fetch folders from database
  const { data: dbFolders = [], isLoading: foldersLoading, refetch: refetchFolders } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/folders'],
  });

  // Fetch images from database
  const { data: images = [], isLoading, error, refetch: refetchImages } = useQuery<DBImage[]>({
    queryKey: ['/api/images'],
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => apiRequest('POST', '/api/folders', { name }),
    onSuccess: () => {
      // Manual refetch to ensure UI updates immediately
      refetchFolders();
      refetchImages();
      toast({
        title: "Folder Created",
        description: "Folder created successfully.",
      });
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    }
  });

  // Generate unique folders list from database and images
  const allFolderNames = Array.from(new Set([
    ...(Array.isArray(dbFolders) ? dbFolders.map(f => f.name) : []),
    ...(Array.isArray(images) ? images.map((img: DBImage) => img.folder || 'uncategorized') : [])
  ]));
  
  // Combined folders for UI (database folders + any folders from images that aren't saved yet)
  const uniqueFolders = ['uncategorized', ...allFolderNames.filter(name => name !== 'uncategorized')];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const base64Data = await fileToBase64(file);
      return apiRequest('POST', '/api/images', {
        filename: `${Date.now()}_${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        folder: uploadFolder || 'uncategorized',
        binaryData: base64Data
      });
    },
    onSuccess: () => {
      // Manual refetch to ensure UI updates immediately
      refetchImages();
      refetchFolders();
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => apiRequest('DELETE', `/api/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Image Deleted",
        description: "Image has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    }
  });

  // Update mutation (for moving images between folders)
  const updateMutation = useMutation({
    mutationFn: ({ imageId, updates }: { imageId: number; updates: Partial<DBImage> }) => 
      apiRequest('PUT', `/api/images/${imageId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Success",  
        description: "Image updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    }
  });

  const filteredImages = selectedFolder === "all" 
    ? (Array.isArray(images) ? images : [])
    : (Array.isArray(images) ? images.filter((img: DBImage) => img.folder === selectedFolder) : []);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Validate files and upload to database
      Array.from(files).forEach((file) => {
        // Validate file type (support images and videos)
        const supportedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
        
        if (!supportedImageTypes.includes(file.type) && !supportedVideoTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported format. Please use JPG, PNG for images or MP4, WEBM, OGG for videos.`,
            variant: "destructive",
          });
          return;
        }

        // Validate file size (5MB limit for images, 50MB for videos)
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        const sizeLimit = file.type.startsWith('video/') ? '50MB' : '5MB';
        
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} is too large. Please keep files under ${sizeLimit}.`,
            variant: "destructive",
          });
          return;
        }

        // Upload to database
        uploadMutation.mutate(file);
      });
    }
  };

  const handleDelete = (imageId: number) => {
    deleteMutation.mutate(imageId);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderName = newFolderName.trim();
      createFolderMutation.mutate(folderName);
    }
  };

  const handlePreview = (image: any) => {
    setSelectedImage(image);
    setIsPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageSelect = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.id));
    }
  };

  const handleMoveImages = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to move.",
        variant: "destructive",
      });
      return;
    }
    setIsMoveDialogOpen(true);
  };

  const confirmMoveImages = async () => {
    if (!targetFolder) {
      toast({
        title: "No Target Folder",
        description: "Please select a target folder.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Move each selected image to the target folder
      await Promise.all(
        selectedImages.map(imageId => 
          updateMutation.mutateAsync({ imageId, updates: { folder: targetFolder } })
        )
      );

      toast({
        title: "Media Moved",
        description: `${selectedImages.length} item(s) moved to "${targetFolder}" folder.`,
      });
    } catch (error) {
      toast({
        title: "Move Failed",
        description: "Failed to move some media files. Please try again.",
        variant: "destructive",
      });
    }

    setSelectedImages([]);
    setIsMoveDialogOpen(false);
    setTargetFolder("");
    setIsMoveMode(false);
  };

  const handleCancelMove = () => {
    setSelectedImages([]);
    setIsMoveMode(false);
  };

  return (
    <div className="page-content-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-standard">Images & Videos</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {!isMoveMode ? (
            <>
              <div className="flex items-center space-x-2">
                <Label htmlFor="upload-folder" className="text-enhanced-small font-medium text-gray-700 dark:text-gray-300">
                  Upload to:
                </Label>
                <Select value={uploadFolder} onValueChange={setUploadFolder}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFolders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        <div className="flex items-center space-x-2">
                          <Folder className="w-4 h-4" />
                          <span className="capitalize">{folder}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderOpen(true)}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsMoveMode(true)}
              >
                <Move className="w-4 h-4 mr-2" />
                Move Media
              </Button>
              <Button onClick={handleUpload} className="gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {selectedImages.length} image(s) selected
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedImages.length === filteredImages.length ? "Deselect All" : "Select All"}
              </Button>
              <Button
                variant="outline"
                onClick={handleMoveImages}
                disabled={selectedImages.length === 0}
              >
                <Move className="w-4 h-4 mr-2" />
                Move Selected
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelMove}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Explanation Section */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="explanation" className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-700 rounded-lg px-4">
            <AccordionTrigger className="text-green-700 dark:text-green-300 hover:no-underline">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                What are Images and Videos in PostMeAI?
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Images and videos are the visual foundation of your social media content. Our media library serves as your centralized repository, 
                helping you organize, manage, and quickly access all your visual assets for creating engaging posts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Visual Content</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Photos, videos, graphics, logos, and branded visuals for your posts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                    <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Organization</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Organize assets by folders: marketing, products, team, templates</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Brand Assets</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Store logos, brand colors, and template designs for consistency</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700 mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Why We Have Images in PostMeAI?</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• <strong>Quick Access:</strong> Instantly find and use images when creating posts or templates</li>
                  <li>• <strong>Brand Consistency:</strong> Maintain visual identity across all social media platforms</li>
                  <li>• <strong>Efficiency:</strong> Upload once, use everywhere - no need to re-upload for each post</li>
                  <li>• <strong>Organization:</strong> Keep your media library tidy with folder structures and easy search</li>
                  <li>• <strong>Integration:</strong> Seamlessly add images to AI-generated or manual posts</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Folder Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Label htmlFor="folder-filter" className="font-medium text-gray-900 dark:text-white">Filter by folder:</Label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Media</SelectItem>
              {uniqueFolders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span className="capitalize">{folder}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">
            {filteredImages.length} item{filteredImages.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            <span className="ml-3">Loading images...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-red-600">
            <span>Failed to load images. Please try again.</span>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 p-4 md:p-6">
            {filteredImages.map((image) => (
              <div key={image.id} className={`group relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${isMoveMode && selectedImages.includes(image.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                <div className="aspect-square relative">
                  {isMoveMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => handleImageSelect(image.id)}
                        className="bg-white border-2 border-gray-300"
                      />
                    </div>
                  )}
                  {isVideoFile(image.mimeType) ? (
                    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                      <video
                        src={getImageDataUrl(image.binaryData, image.mimeType)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={getImageDataUrl(image.binaryData, image.mimeType)}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!isMoveMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePreview(image)}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.id)}
                          className="bg-red-500/90 hover:bg-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate text-gray-900 dark:text-white" title={image.originalName}>
                    {image.originalName}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(image.fileSize)}</span>
                    <span>{image.mimeType}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs capitalize dark:border-gray-600 dark:text-gray-300">
                      {image.folder || 'uncategorized'}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {selectedFolder === "all" ? "No media uploaded yet" : `No media in ${selectedFolder} folder`}
            </p>
            <Button onClick={handleUpload} variant="outline" className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Media
            </Button>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your images
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image/Video Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedImage && isVideoFile(selectedImage.mimeType) ? (
                <Video className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
              {selectedImage?.originalName}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                {isVideoFile(selectedImage.mimeType) ? (
                  <video
                    src={getImageDataUrl(selectedImage.binaryData, selectedImage.mimeType)}
                    className="w-full max-h-96 object-contain rounded-lg"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={getImageDataUrl(selectedImage.binaryData, selectedImage.mimeType)}
                    alt={selectedImage.originalName}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(selectedImage.fileSize)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedImage.mimeType}
                </div>
                <div>
                  <span className="font-medium">Folder:</span> {selectedImage.folder || 'uncategorized'}
                </div>
                <div>
                  <span className="font-medium">Upload Date:</span> {new Date(selectedImage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Media Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Media</DialogTitle>
            <DialogDescription>
              Move {selectedImages.length} selected item(s) to a different folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-folder">Target Folder</Label>
              <Select value={targetFolder} onValueChange={setTargetFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target folder" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueFolders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4" />
                        <span className="capitalize">{folder}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmMoveImages} className="gradient-primary">
                <Move className="w-4 h-4 mr-2" />
                Move Media
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
