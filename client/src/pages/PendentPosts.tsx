import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, X, Clock, Calendar, Edit3 } from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from "react-icons/si";

// Mock data for demonstration
const pendentPosts = [
  {
    id: 1,
    title: "🚀 Unlock Your Business Potential with AI Innovation",
    content: "In today's rapidly evolving business landscape, artificial intelligence isn't just a buzzword—it's the key to unlocking unprecedented growth and efficiency. From automating routine tasks to predicting market trends, AI empowers businesses to make smarter decisions and stay ahead of the competition.",
    platforms: ["facebook", "linkedin", "instagram"],
    scheduledDate: "2025-06-28",
    scheduledTime: "09:00",
    status: "pending_review",
    templateName: "Business AI Innovation Template",
    executionMode: "review",
    createdAt: "2025-06-27T12:00:00Z"
  },
  {
    id: 2,
    title: "🌟 Transform Your Content Strategy Today",
    content: "Content creation doesn't have to be overwhelming. With the right tools and strategies, you can build a content pipeline that engages your audience and drives real results. Let's explore how to streamline your content workflow and maximize your impact.",
    platforms: ["linkedin", "facebook", "tiktok"],
    scheduledDate: "2025-06-29",
    scheduledTime: "14:30",
    status: "pending_review",
    templateName: "Content Strategy Template",
    executionMode: "review",
    createdAt: "2025-06-27T14:30:00Z"
  },
  {
    id: 3,
    title: "💡 Innovation Meets Implementation",
    content: "Great ideas are just the beginning. The real magic happens when innovation meets flawless implementation. Here's how successful companies bridge the gap between vision and reality, turning breakthrough concepts into market-leading solutions.",
    platforms: ["linkedin", "youtube", "discord"],
    scheduledDate: "2025-06-30",
    scheduledTime: "11:00",
    status: "pending_review",
    templateName: "Innovation Implementation Template",
    executionMode: "review",
    createdAt: "2025-06-27T16:45:00Z"
  }
];

// Platform icon mapping
const getPlatformIcon = (platformId: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    linkedin: SiLinkedin,
    tiktok: SiTiktok,
    youtube: SiYoutube,
    discord: SiDiscord,
    telegram: SiTelegram,
  };
  return iconMap[platformId] || SiFacebook;
};

// Platform colors
const platformColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F", 
  linkedin: "#0A66C2",
  tiktok: "#000000",
  youtube: "#FF0000",
  discord: "#5865F2",
  telegram: "#0088CC"
};

export default function PendentPosts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState(pendentPosts);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editedContent, setEditedContent] = useState("");

  const handleApprove = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast({
      title: t('pendentPosts.toast.postApproved.title'),
      description: t('pendentPosts.toast.postApproved.description'),
    });
  };

  const handleReject = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast({
      title: t('pendentPosts.toast.postRejected.title'),
      description: t('pendentPosts.toast.postRejected.description'),
      variant: "destructive",
    });
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setEditedContent(post.content);
  };

  const handleSaveEdit = () => {
    if (selectedPost) {
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, content: editedContent }
          : p
      ));
      setSelectedPost(null);
      toast({
        title: t('pendentPosts.toast.postUpdated.title'),
        description: t('pendentPosts.toast.postUpdated.description'),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page-content">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pendentPosts.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('pendentPosts.subtitle')}</p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Check className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pendentPosts.noPosts.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('pendentPosts.noPosts.description')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-gray-900 dark:text-white">{post.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 text-sm dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.scheduledDate)} at {post.scheduledTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {post.executionMode === "review" ? t('pendentPosts.reviewMode') : t('pendentPosts.autoMode')}
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                      {t('pendentPosts.pendingReview')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('pendentPosts.contentPreview')}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {post.content}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('pendentPosts.publishingPlatforms')}</h4>
                      <div className="flex items-center space-x-2">
                        {post.platforms.map((platformId) => {
                          const PlatformIcon = getPlatformIcon(platformId);
                          return (
                            <div 
                              key={platformId}
                              className="flex items-center space-x-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border text-xs dark:border-gray-600"
                              style={{ borderColor: platformColors[platformId] }}
                            >
                              <PlatformIcon style={{ fontSize: '12px', color: platformColors[platformId] }} />
                              <span className="capitalize text-gray-900 dark:text-white">{platformId}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('pendentPosts.template')} {post.templateName}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(post)}
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              {t('pendentPosts.buttons.edit')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{t('pendentPosts.editDialog.title')}</DialogTitle>
                              <DialogDescription>
                                {t('pendentPosts.editDialog.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">{t('pendentPosts.editDialog.titleLabel')}</label>
                                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">{selectedPost?.title}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">{t('pendentPosts.editDialog.contentLabel')}</label>
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  rows={6}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                                  {t('pendentPosts.buttons.cancel')}
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  {t('pendentPosts.buttons.saveChanges')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReject(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t('pendentPosts.buttons.reject')}
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleApprove(post.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {t('pendentPosts.buttons.approve')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}