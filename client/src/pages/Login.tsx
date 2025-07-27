import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FaFacebook, FaGoogle, FaLinkedin } from "react-icons/fa";
import { Loader2, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import EmailVerification from './EmailVerification';
import PasswordStrengthCheck from "@/components/PasswordStrengthCheck";
import { createPasswordRequirements, validatePassword, isPasswordStrong, type PasswordRequirement } from "@/utils/passwordValidation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface LoginProps {
  initialTab?: "login" | "register";
  focusField?: "email" | "firstName";
}

export default function Login({ initialTab = "login", focusField = "email" }: LoginProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>(createPasswordRequirements());
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus on appropriate field when tab changes or component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "login" && emailRef.current) {
        emailRef.current.focus();
      } else if (activeTab === "register") {
        if (focusField === "firstName" && firstNameRef.current) {
          firstNameRef.current.focus();
        } else if (focusField === "email" && emailRef.current) {
          emailRef.current.focus();
        }
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [activeTab, focusField]);

  // Handle password strength validation
  const handlePasswordChange = (password: string) => {
    setRegisterPassword(password);
    registerForm.setValue("password", password);
    const updatedRequirements = validatePassword(password, passwordRequirements);
    setPasswordRequirements(updatedRequirements);
  };
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Save last auth method
        localStorage.setItem("lastAuthMethod", "local");
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
        });
        // Add a slight delay to ensure auth state updates
        setTimeout(() => {
          setLocation("/");
        }, 100);
      },
      onError: (error: any) => {
        // Check if it's an email verification error
        if (error.requiresVerification) {
          setVerificationEmail(data.email);
          setShowEmailVerification(true);
          return;
        }
        
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      },
    });
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data, {
      onSuccess: (response: any) => {
        // Check if verification is required
        if (response.message && response.message.includes("check your email")) {
          setVerificationEmail(data.email);
          setShowEmailVerification(true);
          toast({
            title: "Registration Successful",
            description: "Please check your email to verify your account.",
          });
          return;
        }
        
        // Save last auth method
        localStorage.setItem("lastAuthMethod", "local");
        toast({
          title: "Success",
          description: "Account created successfully! You are now logged in.",
        });
        // Navigate directly without reload - auth state should be updated by the mutation
        setLocation("/");
      },
      onError: (error: any) => {
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      },
    });
  };

  const getLastAuthMethod = () => {
    return localStorage.getItem("lastAuthMethod") || "local";
  };

  const getLastAuthText = (method: string) => {
    switch (method) {
      case "local":
        return "Last logged in with email/password";
      case "google":
        return "Last logged in with Google";
      case "facebook":
        return "Last logged in with Facebook";
      case "linkedin":
        return "Last logged in with LinkedIn";
      case "github":
        return "Last logged in with GitHub";
      default:
        return "Last used";
    }
  };

  // Show email verification screen if needed
  if (showEmailVerification) {
    return (
      <EmailVerification 
        email={verificationEmail}
        onBack={() => setShowEmailVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome to PostMeAI</CardTitle>
          <CardDescription>Sign in to continue creating amazing content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Primary OAuth Methods */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Quick & secure sign-in:</p>
              
              {/* Google OAuth */}
              <a href="/auth/google" className="block w-full" onClick={() => localStorage.setItem("lastAuthMethod", "google")}>
                <Button
                  variant="outline"
                  className="w-full justify-center bg-[#DB4437] hover:bg-[#C23321] border-2 border-[#DB4437] text-white font-medium py-3"
                  type="button"
                >
                  <FaGoogle className="mr-3 w-5 h-5 text-white" />
                  Continue with Google
                </Button>
              </a>
              {/* Facebook OAuth */}
              <a href="/auth/facebook" className="block w-full" onClick={() => localStorage.setItem("lastAuthMethod", "facebook")}>
                <Button
                  variant="outline"
                  className="w-full justify-center bg-[#1877F2] hover:bg-[#166FE5] border-2 border-[#1877F2] text-white font-medium py-3"
                  type="button"
                >
                  <FaFacebook className="mr-3 w-5 h-5 text-white" />
                  Continue with Facebook
                </Button>
              </a>
              {/* LinkedIn OAuth */}
              <a href="/auth/linkedin" className="block w-full" onClick={() => localStorage.setItem("lastAuthMethod", "linkedin")}>
                <Button
                  variant="outline"
                  className="w-full justify-center bg-[#0A66C2] hover:bg-[#084890] border-2 border-[#0A66C2] text-white font-medium py-3"
                  type="button"
                >
                  <FaLinkedin className="mr-3 w-5 h-5 text-white" />
                  Continue with LinkedIn
                </Button>
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {getLastAuthText(getLastAuthMethod())}
                </span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Get Started</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      ref={emailRef}
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...loginForm.register("password", {
                          onChange: (e) => setLoginPassword(e.target.value)
                        })}
                      />
                      {loginPassword && (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                  <div className="space-y-2 mt-3">
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/forgot-password">
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Forgot your password?
                        </Button>
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      Don't have an account? Choose "Get Started" or{" "}
                      <button 
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-primary hover:underline font-medium"
                      >
                        click here
                      </button>
                      .
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">First Name</Label>
                      <Input
                        id="register-firstName"
                        placeholder="John"
                        ref={firstNameRef}
                        {...registerForm.register("firstName")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Last Name</Label>
                      <Input
                        id="register-lastName"
                        placeholder="Doe"
                        {...registerForm.register("lastName")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register("password", {
                          onChange: (e) => handlePasswordChange(e.target.value)
                        })}
                      />
                      {registerPassword && (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                    <PasswordStrengthCheck requirements={passwordRequirements} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="register-confirmPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register("confirmPassword")}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending || !isPasswordStrong(passwordRequirements)}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 text-center mt-3">
                    If you already have an account, choose "Sign In" or{" "}
                    <button 
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-primary hover:underline font-medium"
                    >
                      click here
                    </button>
                    .
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}