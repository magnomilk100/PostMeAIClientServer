import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  Clock, 
  Database, 
  FileText, 
  Image, 
  Calendar,
  Users,
  CreditCard,
  Settings
} from "lucide-react";

export default function UserDataDeletion() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch user data summary
  const { data: dataSummary, isLoading } = useQuery({
    queryKey: ['/api/user/data-summary']
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/user/delete-account', { confirmation: confirmationText }),
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
        variant: "default",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteAccount = () => {
    if (confirmationText !== "DELETE MY ACCOUNT" || !acknowledged) {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE MY ACCOUNT' and acknowledge the warnings.",
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate();
  };

  const dataTypes = [
    { icon: FileText, label: "Posts & Content", count: dataSummary?.posts || 0 },
    { icon: Image, label: "Images & Videos", count: dataSummary?.media || 0 },
    { icon: Calendar, label: "Scheduled Posts", count: dataSummary?.schedules || 0 },
    { icon: Users, label: "Social Media Configs", count: dataSummary?.socialConfigs || 0 },
    { icon: CreditCard, label: "Payment History", count: dataSummary?.transactions || 0 },
    { icon: Settings, label: "Templates", count: dataSummary?.templates || 0 },
  ];

  return (
    <Layout>
      <div className="page-content">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Delete Your Account
          </h1>
          <p className="text-enhanced text-muted">
            Permanently remove your account and all associated data from PostMeAI.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
            </AlertDescription>
          </Alert>

          {/* Data Summary */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Your Data Summary
              </CardTitle>
              <CardDescription>
                Overview of data that will be permanently deleted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataTypes.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted">{item.count} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Gets Deleted */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                What Gets Deleted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Personal Information</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Profile information and settings</li>
                      <li>• Login credentials and authentication</li>
                      <li>• Email preferences and notifications</li>
                      <li>• Company information and branding</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Content & Media</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• All posts and generated content</li>
                      <li>• Uploaded images and videos</li>
                      <li>• Media folders and organization</li>
                      <li>• AI-generated content history</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Scheduling & Automation</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• All scheduled posts and campaigns</li>
                      <li>• Automated templates and configurations</li>
                      <li>• Posting schedules and timing</li>
                      <li>• Execution history and logs</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Billing & Integrations</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Payment history and transactions</li>
                      <li>• Subscription and billing information</li>
                      <li>• Social media platform connections</li>
                      <li>• API keys and authentication tokens</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Information */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Deletion Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Immediate Account Deactivation</p>
                    <p className="text-sm text-muted">Your account will be immediately deactivated and you'll be logged out.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Data Deletion (24-48 hours)</p>
                    <p className="text-sm text-muted">All your data will be permanently deleted from our servers within 24-48 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Backup Removal (30 days)</p>
                    <p className="text-sm text-muted">Any backup copies will be removed within 30 days for complete data erasure.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Section */}
          <Card className="modern-card border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Shield className="h-5 w-5" />
                Confirm Account Deletion
              </CardTitle>
              <CardDescription>
                This action cannot be undone. Please confirm your decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-red-600">DELETE MY ACCOUNT</code> to confirm:
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                />
                <label htmlFor="acknowledge" className="text-sm">
                  I understand that this action is permanent and cannot be undone. All my data will be permanently deleted.
                </label>
              </div>

              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={confirmationText !== "DELETE MY ACCOUNT" || !acknowledged}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account Permanently
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Final Confirmation</DialogTitle>
                    <DialogDescription>
                      Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Yes, Delete My Account
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Need Help Instead?</CardTitle>
              <CardDescription>
                Before deleting your account, consider these alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" onClick={() => navigate("/documentation")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Help Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}