import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
}

export default function EmailVerification({ email, onBack }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await apiRequest('POST', '/api/auth/resend-verification', { email });
      
      setEmailSent(true);
      toast({
        title: "Email sent successfully",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification email to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Please verify your email to continue</p>
                <p>Click the verification link in your email to activate your account and start using PostMeAI.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Didn't receive the email? Check your spam folder or request a new one.
              </p>
              
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            {emailSent && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium">Email sent successfully!</p>
                    <p>Please check your inbox and click the verification link.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button 
                onClick={onBack}
                variant="ghost"
                className="text-sm"
              >
                Back to Login
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>Email verification links expire after 24 hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}