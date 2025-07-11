import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FaFacebook, FaGoogle, FaLinkedin, FaGithub } from "react-icons/fa";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  
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
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
        });
        // Add a slight delay to ensure auth state updates
        setTimeout(() => {
          setLocation("/");
          // Force page refresh to ensure auth state is properly loaded
          window.location.reload();
        }, 100);
      },
      onError: (error: any) => {
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
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Account created successfully! You are now logged in.",
        });
        // Add a slight delay to ensure auth state updates
        setTimeout(() => {
          setLocation("/");
          // Force page refresh to ensure auth state is properly loaded
          window.location.reload();
        }, 100);
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

  const getAuthProviders = () => {
    const lastMethod = getLastAuthMethod();
    const providers = [
      { id: "google", name: "Google", icon: FaGoogle, color: "#DB4437", url: "/auth/google" },
      { id: "facebook", name: "Facebook", icon: FaFacebook, color: "#1877F2", url: "/auth/facebook" },
      { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", url: "/auth/linkedin" },
      { id: "github", name: "GitHub", icon: FaGithub, color: "#333333", url: "/auth/github" },
      { id: "local", name: "Email & Password", icon: null, color: "#6366F1", url: null },
    ];

    // Always prioritize Google unless user specifically used another method last
    if (lastMethod !== "google") {
      const lastProvider = providers.find(p => p.id === lastMethod);
      const otherProviders = providers.filter(p => p.id !== lastMethod);
      return lastProvider ? [lastProvider, ...otherProviders] : providers;
    }
    
    return providers;
  };

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
              <a href="/auth/google" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-center bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-medium py-3"
                  type="button"
                >
                  <FaGoogle className="mr-3 w-5 h-5 text-[#DB4437]" />
                  Continue with Google
                </Button>
              </a>
              {/* Facebook OAuth */}
              <a href="/auth/facebook" className="block w-full">
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
              <Button
                variant="outline"
                className="w-full justify-center bg-[#0A66C2] hover:bg-[#084A8A] border-2 border-[#0A66C2] text-white font-medium py-3"
                type="button"
                onClick={() => {
                  const popup = window.open(
                    '/auth/linkedin',
                    'linkedin-auth',
                    'width=500,height=600,scrollbars=yes,resizable=yes'
                  );
                  
                  const checkClosed = setInterval(() => {
                    if (popup?.closed) {
                      clearInterval(checkClosed);
                      window.location.reload();
                    }
                  }, 1000);
                }}
              >
                <FaLinkedin className="mr-3 w-5 h-5 text-white" />
                Continue with LinkedIn
              </Button>
            </div>
            <Separator />
            {/* Other OAuth Providers */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Or choose another sign-in method:</p>
              {getAuthProviders().slice(1).filter(p => p.id !== "facebook" && p.id !== "linkedin").map((provider) => {
                if (provider.id === "local") {
                  return (
                    <Button
                      key={provider.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("login")}
                      style={{ borderColor: provider.color, color: provider.color }}
                    >
                      <span className="mr-2">📧</span>
                      {provider.name}
                      {getLastAuthMethod() === "local" && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Last used</span>
                      )}
                    </Button>
                  );
                }

                const Icon = provider.icon!;
                return (
                  <a key={provider.id} href={provider.url!} className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      type="button"
                      style={{ borderColor: provider.color, color: provider.color }}
                    >
                      <Icon className="mr-2 w-4 h-4" />
                      Continue with {provider.name}
                      {getLastAuthMethod() === provider.id && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Last used</span>
                      )}
                    </Button>
                  </a>
                );
              })}
            </div>

            <Separator />

            {/* Email/Password Forms */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                    />
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
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
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
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}