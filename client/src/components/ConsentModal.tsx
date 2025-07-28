import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { Shield, Cookie, FileText, Eye, BarChart, Target, ExternalLink, X } from 'lucide-react';

interface ConsentData {
  mandatoryCookies: boolean;
  analyticsCookies: boolean;
  personalizationCookies: boolean;
  marketingCookies: boolean;
  privacyPolicy: boolean;
  termsOfUse: boolean;
  timestamp: number;
}

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: (consentData: ConsentData) => void;
  onClose?: () => void;
}

const CONSENT_STORAGE_KEY = 'postmeai_user_consent';

export function ConsentModal({ isOpen, onConsent, onClose }: ConsentModalProps) {
  const [, setLocation] = useLocation();
  const [showCustomize, setShowCustomize] = useState(false);
  
  // Consent state - all optional cookies active by default
  const [mandatoryCookies, setMandatoryCookies] = useState(true); // Always true, required
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [personalizationCookies, setPersonalizationCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(true);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [termsOfUse, setTermsOfUse] = useState(false);

  // Validation
  const canProceed = mandatoryCookies && privacyPolicy && termsOfUse;

  // Helper function to log consent decision to audit API
  const logConsentDecision = async (action: string, consentData: ConsentData) => {
    try {
      const sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      
      await fetch('/api/consent/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          consentAction: action,
          privacyPolicyAccepted: consentData.privacyPolicy,
          termsOfUseAccepted: consentData.termsOfUse,
          mandatoryCookies: consentData.mandatoryCookies,
          analyticsCookies: consentData.analyticsCookies,
          personalizationCookies: consentData.personalizationCookies,
          marketingCookies: consentData.marketingCookies,
          consentData: consentData
        })
      });
    } catch (error) {
      console.error('Failed to log consent decision:', error);
      // Continue with consent flow even if logging fails
    }
  };

  // Handle Accept All
  const handleAcceptAll = async () => {
    const consentData: ConsentData = {
      mandatoryCookies: true,
      analyticsCookies: true,
      personalizationCookies: true,
      marketingCookies: true,
      privacyPolicy: true,
      termsOfUse: true,
      timestamp: Date.now()
    };
    
    // Log consent decision for audit trail
    await logConsentDecision('accept_all', consentData);
    
    // Store consent in localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    onConsent(consentData);
  };

  // Handle Accept Current Configuration
  const handleAcceptCurrent = async () => {
    if (!canProceed) return;
    
    const consentData: ConsentData = {
      mandatoryCookies,
      analyticsCookies,
      personalizationCookies,
      marketingCookies,
      privacyPolicy: true, // Always accept for this action
      termsOfUse: true, // Always accept for this action
      timestamp: Date.now()
    };
    
    // Log consent decision for audit trail
    await logConsentDecision('accept_current', consentData);
    
    // Store consent in localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    onConsent(consentData);
  };

  // Handle Save Preferences (from customize mode)
  const handleSavePreferences = async () => {
    if (!canProceed) return;
    
    const consentData: ConsentData = {
      mandatoryCookies,
      analyticsCookies,
      personalizationCookies,
      marketingCookies,
      privacyPolicy,
      termsOfUse,
      timestamp: Date.now()
    };
    
    // Log consent decision for audit trail
    await logConsentDecision('customize_preferences', consentData);
    
    // Store consent in localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    onConsent(consentData);
  };

  // Handle Reject - show toast message and close modal
  const handleReject = async () => {
    const rejectData: ConsentData = {
      mandatoryCookies: false,
      analyticsCookies: false,
      personalizationCookies: false,
      marketingCookies: false,
      privacyPolicy: false,
      termsOfUse: false,
      timestamp: Date.now()
    };
    
    // Log rejection for audit trail
    await logConsentDecision('reject_all', rejectData);
    
    // Show toast message and close modal
    if (onClose) {
      onClose();
    }
    // Toast will be shown by parent component
  };

  const openPrivacyPolicy = () => {
    window.open('/privacy-policy', '_blank');
  };

  const openTermsOfUse = () => {
    window.open('/terms-of-use', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose || (() => {})}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            Your Privacy & Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Introduction */}
          <div className="text-sm text-muted-foreground">
            We respect your privacy and are committed to protecting your personal data. 
            Please review and customize your preferences below to continue using PostMeAI.
          </div>

          {/* Cookie Consent Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cookie className="h-4 w-4 text-orange-600" />
                Cookie Settings
              </CardTitle>
              <CardDescription className="text-sm">
                We use cookies to provide essential functionality and enhance your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Mandatory Cookies */}
              <div className="flex items-start justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">Essential Cookies</h4>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      Required
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Authentication, security, and basic functionality.
                  </p>
                </div>
                <div className="ml-3">
                  <Switch checked={true} disabled className="opacity-50" />
                </div>
              </div>

              {showCustomize && (
                <>
                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-sm">Analytics Cookies</h4>
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Usage analytics to improve performance.
                      </p>
                    </div>
                    <div className="ml-3">
                      <Switch 
                        checked={analyticsCookies} 
                        onCheckedChange={setAnalyticsCookies}
                      />
                    </div>
                  </div>

                  {/* Personalization Cookies */}
                  <div className="flex items-start justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium text-sm">Personalization Cookies</h4>
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Remember preferences and settings.
                      </p>
                    </div>
                    <div className="ml-3">
                      <Switch 
                        checked={personalizationCookies} 
                        onCheckedChange={setPersonalizationCookies}
                      />
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-pink-600" />
                        <h4 className="font-medium text-sm">Marketing Cookies</h4>
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Relevant advertisements and campaigns.
                      </p>
                    </div>
                    <div className="ml-3">
                      <Switch 
                        checked={marketingCookies} 
                        onCheckedChange={setMarketingCookies}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Privacy Policy & Terms Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-indigo-600" />
                Legal Agreements
              </CardTitle>
              <CardDescription className="text-sm">
                Please review and accept our legal agreements to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Privacy Policy */}
              <div className="flex items-start gap-3 p-2 border rounded-lg">
                <Checkbox 
                  id="privacy-policy"
                  checked={privacyPolicy}
                  onCheckedChange={(checked) => setPrivacyPolicy(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label htmlFor="privacy-policy" className="text-sm font-medium cursor-pointer">
                    I accept the Privacy Policy
                  </label>
                  <div className="mt-1">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                      onClick={openPrivacyPolicy}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read Privacy Policy
                    </Button>
                  </div>
                </div>
              </div>

              {/* Terms of Use */}
              <div className="flex items-start gap-3 p-2 border rounded-lg">
                <Checkbox 
                  id="terms-of-use"
                  checked={termsOfUse}
                  onCheckedChange={(checked) => setTermsOfUse(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label htmlFor="terms-of-use" className="text-sm font-medium cursor-pointer">
                    I accept the Terms of Use
                  </label>
                  <div className="mt-1">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                      onClick={openTermsOfUse}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read Terms of Use
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Legal Acceptance Notice - Only show when not accepted */}
          {(!privacyPolicy || !termsOfUse) && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium text-center">
                ⚠️ You must accept the Privacy Policy and Terms of Use to continue.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <Separator />
          
          <div className="space-y-4">
            {!showCustomize ? (
              <div className="space-y-3">
                {/* Accept All Button */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleAcceptAll}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ✓ Accept All
                  </Button>
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Accept all cookies and legal agreements for full functionality and personalized experience
                  </p>
                </div>

                {/* Accept Current Configuration Button */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleAcceptCurrent}
                    disabled={!canProceed}
                    className={`w-full font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 ${
                      canProceed 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-md'
                    }`}
                  >
                    ✓ Accept Current Configuration
                  </Button>
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Accept Privacy Policy and Terms of Use with your current cookie preferences
                  </p>
                </div>

                {/* Customize Preferences Button */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowCustomize(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ⚙️ Customize Preferences
                  </Button>
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Customize your cookie settings and review detailed privacy options
                  </p>
                </div>

                {/* Don't Accept Button */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleReject}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ✗ Don't Accept Privacy Policy and Terms of Use
                  </Button>
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Decline legal agreements - you will not be able to use the application
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  onClick={handleSavePreferences}
                  disabled={!canProceed}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Save Preferences
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomize(false)}
                  className="flex-1 border-2 border-gray-400 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Back
                </Button>
              </div>
            )}
            
            {/* Additional Validation message for customize mode */}
            {showCustomize && !canProceed && (
              <p className="text-xs text-red-600 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                Please check the required boxes above to continue.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if user has given consent
export function useConsentStatus() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        const data: ConsentData = JSON.parse(stored);
        setConsentData(data);
        setHasConsent(true);
      } catch {
        setHasConsent(false);
      }
    } else {
      setHasConsent(false);
    }
  }, []);

  const clearConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setHasConsent(false);
    setConsentData(null);
  };

  return { hasConsent, consentData, clearConsent };
}