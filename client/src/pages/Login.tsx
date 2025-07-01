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
        setLocation("/");
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

  const getAuthProviders = () => {
    const lastMethod = getLastAuthMethod();
    const providers = [
      { id: "facebook", name: "Facebook", icon: FaFacebook, color: "#1877F2", url: "/auth/facebook" },
      { id: "google", name: "Google", icon: FaGoogle, color: "#DB4437", url: "/auth/google" },
      { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", url: "/auth/linkedin" },
      { id: "github", name: "GitHub", icon: FaGithub, color: "#333333", url: "/auth/github" },
      { id: "local", name: "Email & Password", icon: null, color: "#6366F1", url: null },
    ];

    // Move last used method to the top
    const lastProvider = providers.find(p => p.id === lastMethod);
    const otherProviders = providers.filter(p => p.id !== lastMethod);
    
    return lastProvider ? [lastProvider, ...otherProviders] : providers;
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
            {/* OAuth Providers */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">Choose your preferred sign-in method:</p>
              {getAuthProviders().map((provider) => {
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
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = provider.url!}
                    style={{ borderColor: provider.color, color: provider.color }}
                  >
                    <Icon className="mr-2 w-4 h-4" />
                    Continue with {provider.name}
                    {getLastAuthMethod() === provider.id && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Last used</span>
                    )}
                  </Button>
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