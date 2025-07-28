import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Clock, AlertTriangle, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { FaFacebook, FaGoogle, FaLinkedin } from "react-icons/fa";

const setPasswordSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

export default function InvitationAcceptance() {
  const { key } = useParams<{ key: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!key) {
      navigate("/");
      return;
    }

    // Fetch invitation data to pre-populate email
    const fetchInvitationData = async () => {
      try {
        const response = await fetch(`/api/invitation/${key}`);
        if (response.ok) {
          const data = await response.json();
          setInvitationData(data);
          if (data.email) {
            form.setValue("email", data.email);
          }
        }
      } catch (error) {
        console.error("Error fetching invitation data:", error);
      }
    };

    fetchInvitationData();
  }, [key, navigate, form]);

  // Password validation helper functions
  const checkPasswordRequirement = (password: string, requirement: string) => {
    switch (requirement) {
      case "minLength":
        return password.length >= 8;
      case "uppercase":
        return /[A-Z]/.test(password);
      case "lowercase":
        return /[a-z]/.test(password);
      case "digit":
        return /[0-9]/.test(password);
      case "special":
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
      case "noCommon":
        const commonPasswords = ["password", "123456", "qwerty", "abc123", "password123"];
        return !commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()));
      default:
        return false;
    }
  };

  const onSubmit = async (data: SetPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/invitation/set-password", {
        invitationKey: key,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      setSuccess(true);
      toast({
        title: "Account created successfully",
        description: "You can now sign in with your email and password.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Failed to set password",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                Your account has been created and activated! 
                You can now sign in to PostMeAI with your email and password.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                You're all set! Here's what you can do now:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Sign in to your account immediately
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Access your assigned workspace
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Start creating amazing content!
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Go to PostMeAI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPassword = form.watch("password") || "";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border border-gray-200 shadow-lg bg-white">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="MagnoMilk"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Milk Leite"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="magnomilk@yahoo.com.br"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...form.register("email")}
                readOnly={!!invitationData?.email}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Section with Special Styling */}
            <div className="relative">
              {/* Purple wavy border around password section */}
              <div className="absolute inset-0 border-2 border-purple-500 rounded-3xl" style={{
                borderRadius: "2rem",
                clipPath: "polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)"
              }}></div>
              
              <div className="relative p-6 space-y-4">
                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Password Requirements:
                  </Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "minLength") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "minLength") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "minLength") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        Minimum 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "uppercase") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "uppercase") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "uppercase") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        At least one uppercase letter (A–Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "lowercase") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "lowercase") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "lowercase") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        At least one lowercase letter (a–z)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "digit") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "digit") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "digit") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        At least one digit (0–9)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "special") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "special") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "special") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        At least one special character (!@#$%^&*)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        checkPasswordRequirement(currentPassword, "noCommon") 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}>
                        {checkPasswordRequirement(currentPassword, "noCommon") && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        checkPasswordRequirement(currentPassword, "noCommon") 
                          ? "text-green-600" 
                          : "text-gray-600"
                      }`}>
                        No common passwords or patterns
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      {...form.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-600">
              If you already have an account, choose "Sign In" or{" "}
              <a href="/" className="text-blue-600 hover:underline">
                click here
              </a>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}