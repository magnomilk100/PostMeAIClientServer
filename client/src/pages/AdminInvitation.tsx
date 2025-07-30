import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdminAccess } from "@/hooks/useOrganizationRole";
import { UserPlus, Mail, Calendar, Clock, CheckCircle, XCircle, Settings, Users, RefreshCw, History, Info, AlertCircle, RotateCcw, X, Shield } from "lucide-react";

// Countdown Timer Component
function CountdownTimer({ expiresAt, onExpired }: { expiresAt: string; onExpired?: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        onExpired?.();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <span className={`font-mono text-sm ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
      {timeLeft}
    </span>
  );
}

// Pending Invitation Card with Countdown
function PendingInvitationCard({ invitation }: { invitation: any }) {
  const { toast } = useToast();
  
  const resendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/resend-invitation/${invitation.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Invitation resent",
        description: "A new invitation email has been sent with a fresh expiration time.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-invitations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend invitation",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/cancel-invitation/${invitation.id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Invitation canceled",
        description: "The invitation has been canceled and moved to history.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-invitations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invitation",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
          {invitation.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{invitation.email}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Expires in: <CountdownTimer expiresAt={invitation.expiresAt} /></span>
            <span>•</span>
            <span>Sent: {new Date(invitation.invitedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending || cancelMutation.isPending}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {resendMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend
            </>
          )}
        </Button>
        <Button
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending || resendMutation.isPending}
          size="sm"
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {cancelMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  expirationMinutes: z.number().min(10).max(60),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface WorkspaceRoleAssignment {
  workspaceId: number;
  workspaceName: string;
  roles: string[];
}

interface InvitationData {
  email: string;
  expirationMinutes: number;
  workspaceRoles: WorkspaceRoleAssignment[];
}

// Helper function to get time remaining for invitations
function getTimeRemaining(expiresAt: string) {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  
  if (diff <= 0) {
    return { expired: true, timeText: 'expired' };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return { expired: false, timeText: `${days} day${days > 1 ? 's' : ''} ago` };
  } else if (hours > 0) {
    return { expired: false, timeText: `${hours} hour${hours > 1 ? 's' : ''} ago` };
  } else {
    return { expired: false, timeText: `${minutes} minute${minutes !== 1 ? 's' : ''} ago` };
  }
}

export default function AdminInvitation() {
  const { toast } = useToast();
  const { hasAdminAccess, isLoading: adminAccessLoading } = useAdminAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState("");
  const [workspaceRoles, setWorkspaceRoles] = useState<WorkspaceRoleAssignment[]>([]);

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      expirationMinutes: 10,
    },
  });

  // Available roles - in a real app, this would come from the database
  const availableRoles = [
    "administrator",
    "creator", 
    "publisher",
    "approver",
    "readonly"
  ];

  // Email validation mutation
  const validateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/admin/validate-email", { email });
    },
    onSuccess: (data: any, email) => {
      if (!data.exists) {
        setEmailValidated(true);
        setValidatedEmail(email);
        toast({
          title: "Email Available",
          description: "Email is available for invitation.",
        });
      }
    },
    onError: (error: any) => {
      let title = "Email Not Available";
      let description = "This email cannot be used for invitation.";
      
      // Check if it's a duplicate user error
      if (error.message && error.message.includes("already registered")) {
        title = "User Already Exists";
        description = "This email is already registered in the system. Try a different email address.";
      } else if (error.message && error.message.includes("pending invitation")) {
        title = "Invitation Already Sent";
        description = "There is already a pending invitation for this email address.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Fetch workspaces
  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ["/api/admin/workspaces"],
    enabled: emailValidated,
  });

  // Fetch invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ["/api/admin/invitations"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // State to force re-renders when checking expiration
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every 10 seconds to check for expired invitations
  useEffect(() => {
    // Check immediately on mount
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Check every 10 seconds for more responsive updates

    return () => clearInterval(interval);
  }, []);

  // Filter invitations based on status and expiration
  const pendingInvitations = React.useMemo(() => {
    if (!invitations) return [];
    const now = currentTime;
    return (invitations as any[]).filter(invitation => 
      invitation.status === 'pending' && 
      invitation.expiresAt && 
      new Date(invitation.expiresAt) > now
    );
  }, [invitations, currentTime]);

  const historyInvitations = React.useMemo(() => {
    if (!invitations) return [];
    const now = currentTime;
    return (invitations as any[]).filter(invitation => 
      invitation.status === 'password_set' || 
      invitation.status === 'approved' || 
      invitation.status === 'expired' || 
      invitation.status === 'canceled' ||
      (invitation.status === 'pending' && invitation.expiresAt && new Date(invitation.expiresAt) <= now)
    );
  }, [invitations, currentTime]);



  // Initialize workspace roles when workspaces are loaded
  useEffect(() => {
    if (workspaces && emailValidated && Array.isArray(workspaces)) {
      setWorkspaceRoles(workspaces.map((workspace: any) => ({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        roles: ["creator"] // Default to creator role
      })));
    }
  }, [workspaces, emailValidated]);



  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async (data: InvitationData) => {
      return await apiRequest("POST", "/api/admin/invite-user", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent successfully",
        description: `The user has ${form.getValues().expirationMinutes} minutes to accept the invitation.`,
        variant: "default",
      });
      form.reset();
      setEmailValidated(false);
      setValidatedEmail("");
      setWorkspaceRoles([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
    },
    onError: (error: any) => {
      // Parse the error message to provide user-friendly feedback
      let title = "Failed to send invitation";
      let description = "Please try again later.";
      
      if (error.message) {
        const errorMsg = error.message;
        
        // Check for email domain validation errors
        if (errorMsg.includes("does not accept mail") || errorMsg.includes("nullMX")) {
          title = "Invalid Email Domain";
          description = "The email domain you entered doesn't accept mail. Please verify the email address or use a different email provider.";
        } 
        // Check for rejected email address
        else if (errorMsg.includes("Recipient address rejected")) {
          title = "Email Address Rejected";
          description = "The email address was rejected by the mail server. Please verify the email address is correct.";
        }
        // Check for authentication errors
        else if (errorMsg.includes("authentication failed") || errorMsg.includes("EAUTH")) {
          title = "Email Service Error";
          description = "There's an issue with our email service. Please contact the administrator.";
        }
        // Check for connection errors
        else if (errorMsg.includes("Unable to connect") || errorMsg.includes("ECONNECTION")) {
          title = "Connection Error";
          description = "Unable to connect to email server. Please try again later.";
        }
        // Check for duplicate invitation
        else if (errorMsg.includes("already sent")) {
          title = "Invitation Already Sent";
          description = "An invitation has already been sent to this email address.";
        }
        // Generic error with the actual message
        else {
          description = errorMsg;
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Approve invitation mutation
  const approveInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await apiRequest("POST", `/api/admin/approve-invitation/${invitationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Invitation approved",
        description: "The user account has been activated successfully.",
        variant: "default",
      });
      // Invalidate both pending approvals and invitation history to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve invitation",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      const expirationMinutes = 10; // Default to 10 minutes
      return await apiRequest("POST", `/api/admin/resend-invitation/${invitationId}`, { expirationMinutes });
    },
    onSuccess: () => {
      toast({
        title: "Invitation resent",
        description: "A new invitation email has been sent with a fresh expiration time.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-invitations"] });
    },
    onError: (error: any) => {
      // Parse the error message to provide user-friendly feedback for resend errors
      let title = "Failed to resend invitation";
      let description = "Please try again later.";
      
      if (error.message) {
        const errorMsg = error.message;
        
        // Check for email domain validation errors
        if (errorMsg.includes("does not accept mail") || errorMsg.includes("nullMX")) {
          title = "Invalid Email Domain";
          description = "The recipient's email domain doesn't accept mail. The original invitation cannot be resent to this address.";
        } 
        // Check for rejected email address
        else if (errorMsg.includes("Recipient address rejected")) {
          title = "Email Address Rejected";
          description = "The recipient's email address was rejected by the mail server. Cannot resend invitation.";
        }
        // Check for expired or invalid invitation
        else if (errorMsg.includes("not found") || errorMsg.includes("expired")) {
          title = "Invitation Not Available";
          description = "This invitation is no longer valid or has been removed. Please create a new invitation instead.";
        }
        // Generic error with the actual message
        else {
          description = errorMsg;
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const validateEmailHandler = () => {
    const email = form.getValues("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    validateEmailMutation.mutate(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    form.setValue("email", email);
    
    // Reset validation state when email changes
    setEmailValidated(false);
    setValidatedEmail("");
    setWorkspaceRoles([]);
  };

  const updateWorkspaceRole = (workspaceId: number, roles: string[]) => {
    setWorkspaceRoles(prev => prev.map(wr => 
      wr.workspaceId === workspaceId ? { ...wr, roles } : wr
    ));
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      administrator: "Administrator",
      creator: "Creator", 
      publisher: "Publisher",
      approver: "Post Approver",
      readonly: "Read Only"
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      administrator: "bg-red-500",
      creator: "bg-blue-500",
      publisher: "bg-green-500", 
      approver: "bg-orange-500",
      readonly: "bg-gray-500"
    };
    return colorMap[role] || "bg-gray-500";
  };

  const onSubmit = async () => {
    if (!validatedEmail || workspaceRoles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please ensure email is valid and workspace roles are assigned.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const invitationData: InvitationData = {
        email: validatedEmail,
        expirationMinutes: form.getValues().expirationMinutes,
        workspaceRoles: workspaceRoles
      };
      await inviteUserMutation.mutateAsync(invitationData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (invitationId: number) => {
    await approveInvitationMutation.mutateAsync(invitationId);
  }

  const handleResendInvitation = (invitationId: number) => {
    resendMutation.mutate(invitationId);
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "password_set":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Password Set</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "expired":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
      case "canceled":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while checking admin access
  if (adminAccessLoading) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-muted-foreground">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Check admin access - restrict to administrators OR organization owners
  if (!hasAdminAccess) {
    return (
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page. Administrator privileges required.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-content space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Invitations</h1>
          <p className="text-muted-foreground">
            Invite users to join your organization with specific workspace roles.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Invite User Form */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite New User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user's email address"
                  onChange={handleEmailChange}
                  value={form.watch("email")}
                  className={form.formState.errors.email ? "border-red-500" : ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      validateEmailHandler();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={validateEmailHandler}
                  disabled={validateEmailMutation.isPending || !form.watch("email")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {validateEmailMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Validate"
                  )}
                </Button>
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
              {emailValidated && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Email validated - workspace roles are now available
                </div>
              )}
            </div>

            {/* Expiration Time Selector - Only show after email validation */}
            {emailValidated && (
              <div className="space-y-4">
                <Label htmlFor="expirationMinutes" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Invitation Expiration Time
                </Label>
                <Select
                  value={form.watch("expirationMinutes").toString()}
                  onValueChange={(value) => form.setValue("expirationMinutes", parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="40">40 minutes</SelectItem>
                    <SelectItem value="50">50 minutes</SelectItem>
                    <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The invited user will have {form.watch("expirationMinutes")} minutes to accept the invitation and create their account.
                </p>
              </div>
            )}

            {/* Workspace Role Assignment - Only show after email validation */}
            {emailValidated && (
              <div className="space-y-6">
                <Separator />
                


                {/* Workspace List with Role Assignment */}
                {workspacesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Workspace Role Assignments
                    </h3>
                    
                    <div className="grid gap-4">
                      {workspaceRoles.map((workspace) => (
                        <div
                          key={workspace.workspaceId}
                          className="p-4 border rounded-lg bg-white dark:bg-gray-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{workspace.workspaceName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Select roles for this workspace
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {workspace.roles.map(role => (
                                <Badge
                                  key={role}
                                  className={`${getRoleColor(role)} text-white text-xs`}
                                >
                                  {getRoleDisplayName(role)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableRoles.map(role => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${workspace.workspaceId}-${role}`}
                                  checked={workspace.roles.includes(role)}
                                  onCheckedChange={(checked) => {
                                    const newRoles = checked
                                      ? [...workspace.roles, role]
                                      : workspace.roles.filter(r => r !== role);
                                    updateWorkspaceRole(workspace.workspaceId, newRoles);
                                  }}
                                />
                                <Label
                                  htmlFor={`${workspace.workspaceId}-${role}`}
                                  className="text-sm font-normal"
                                >
                                  {getRoleDisplayName(role)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Send Invitation Button */}
                <Button
                  onClick={onSubmit}
                  disabled={isLoading || inviteUserMutation.isPending || !emailValidated}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading || inviteUserMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation with Role Assignments
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Pending Invitations with Live Countdown */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : invitations && Array.isArray(invitations) && invitations.filter((inv: any) => inv.status === 'pending' && new Date(inv.expiresAt) > new Date()).length > 0 ? (
              <div className="space-y-4">
                {(invitations as any[])
                  .filter((inv: any) => inv.status === 'pending' && new Date(inv.expiresAt) > new Date())
                  .map((invitation: any) => (
                    <PendingInvitationCard key={invitation.id} invitation={invitation} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending invitations</p>
                <p className="text-sm">All invitations have been accepted or expired.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitation History */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Invitation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : invitations && Array.isArray(invitations) && invitations.filter((inv: any) => 
              inv.status === 'password_set' || 
              inv.status === 'approved' || 
              inv.status === 'expired' || 
              inv.status === 'canceled' ||
              (inv.status === 'pending' && inv.expiresAt && new Date(inv.expiresAt) <= new Date())
            ).length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(invitations as any[])
                      .filter((inv: any) => 
                        inv.status === 'password_set' || 
                        inv.status === 'approved' || 
                        inv.status === 'expired' || 
                        inv.status === 'canceled' ||
                        (inv.status === 'pending' && inv.expiresAt && new Date(inv.expiresAt) <= new Date())
                      )
                      .sort((a: any, b: any) => new Date(b.passwordSetAt || b.invitedAt).getTime() - new Date(a.passwordSetAt || a.invitedAt).getTime())
                      .map((invitation: any) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.email}</TableCell>
                          <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(invitation.invitedAt)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invitation.passwordSetAt ? formatDate(invitation.passwordSetAt) : 
                             invitation.status === 'expired' ? 'Expired' : 
                             invitation.status === 'canceled' && invitation.canceledAt ? formatDate(invitation.canceledAt) : 
                             '-'}
                          </TableCell>
                          <TableCell>
                            {invitation.status === 'password_set' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Can Login Now
                              </Badge>
                            )}
                            {invitation.status === 'expired' && (
                              <Button
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={resendMutation.isPending}
                                size="sm"
                                className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                {resendMutation.isPending ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                  <>
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Resend
                                  </>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invitation history</p>
                <p className="text-sm">Completed invitations will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
