import { useAuth } from "@/hooks/useAuth";
import { Crown, Check, Zap, Star, Users, Rocket, Loader2, AlertCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function SubscriptionPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: 29,
      period: "month",
      description: "Perfect for individual creators",
      popular: false,
      features: [
        "100 AI-generated posts per month",
        "5 social media platforms",
        "Basic templates library",
        "Email support",
        "Content scheduling",
        "Basic analytics",
      ],
      icon: Zap,
      color: "blue",
    },
    {
      name: "Pro",
      price: 79,
      period: "month",
      description: "Ideal for growing businesses",
      popular: true,
      features: [
        "Unlimited AI-generated posts",
        "All social media platforms",
        "Premium templates library",
        "Priority support",
        "Advanced scheduling",
        "Detailed analytics",
        "Custom branding",
        "Team collaboration (5 users)",
      ],
      icon: Star,
      color: "purple",
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      description: "For large teams and agencies",
      popular: false,
      features: [
        "Unlimited everything",
        "White-label solution",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced team management",
        "Priority feature requests",
        "Unlimited team members",
        "Custom training sessions",
      ],
      icon: Crown,
      color: "gold",
    },
  ];

  const currentPlan = user?.subscriptionPlan || "none";
  const isActivePlan = user?.subscriptionStatus === "active";
  const isCancelledPlan = user?.subscriptionStatus === "cancelled";

  // Subscription upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async ({ plan, price }: { plan: string; price: number }) => {
      const response = await apiRequest("POST", "/api/subscription/upgrade", { plan, price });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Updated",
        description: data.message || `Successfully upgraded to ${data.user?.subscriptionPlan} plan`,
      });
      setShowConfirmDialog(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  // Subscription cancellation mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel", {});
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Cancelled",
        description: data.message || "Subscription cancelled successfully",
      });
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      upgradeMutation.mutate({ plan: selectedPlan.name, price: selectedPlan.price });
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    cancelMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center">
          <Rocket className="w-10 h-10 mr-3 text-purple-600" />
          {t('subscription.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subscription.subtitle')}
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan !== "none" && isActivePlan && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Check className="w-6 h-6 mr-2" />
              {t('subscription.currentPlan')}: {user?.subscriptionPlan}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600">
                  Status: <span className="font-semibold capitalize">{user?.subscriptionStatus}</span>
                </p>
                {user?.subscriptionExpiresAt && (
                  <p className="text-gray-600 text-sm">
                    Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Plan Notice */}
      {currentPlan !== "none" && isCancelledPlan && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertCircle className="w-6 h-6 mr-2" />
              Subscription Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-orange-600">
                Your <strong>{user?.subscriptionPlan}</strong> plan has been cancelled but remains active until {user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'the end of your billing period'}.
              </p>
              <p className="text-gray-600 text-sm">
                After the expiration date, no further payments will be charged and you can upgrade to a new plan anytime.
              </p>
              <div className="bg-orange-100 border-l-4 border-orange-400 p-3 rounded">
                <p className="text-orange-800 text-sm font-medium">
                  You'll keep access to all premium features until {user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'expiration'}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.name.toLowerCase() && isActivePlan;
          
          return (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                plan.popular 
                  ? 'border-purple-500 ring-2 ring-purple-200 shadow-xl scale-105' 
                  : isCurrentPlan 
                    ? 'border-green-500 ring-2 ring-green-200 hover:ring-4 hover:ring-green-300'
                    : 'border-gray-200 hover:border-purple-300 hover:ring-2 hover:ring-purple-100'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1">
                  {t('subscription.popular')}
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1">
                  {t('subscription.currentPlan')}
                </Badge>
              )}
              
              <CardHeader className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  plan.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t(`subscription.plans.${plan.name.toLowerCase()}.name`)}</CardTitle>
                  <CardDescription className="text-gray-600">{t(`subscription.plans.${plan.name.toLowerCase()}.description`)}</CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/{t(`subscription.${plan.period}`)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Billed monthly • Cancel anytime
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full transition-all duration-200 ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 hover:shadow-lg text-white'
                  }`}
                  disabled={isCurrentPlan || upgradeMutation.isPending}
                  onClick={() => handleUpgrade(plan)}
                >
                  {upgradeMutation.isPending && selectedPlan?.name === plan.name ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('subscription.buttons.upgrading')}
                    </>
                  ) : isCurrentPlan ? (
                    t('subscription.buttons.current')
                  ) : (
                    t('subscription.buttons.upgrade', { plan: t(`subscription.plans.${plan.name.toLowerCase()}.name`) })
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit vs Subscription Comparison */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center">Credits vs. Subscription</CardTitle>
          <CardDescription className="text-center">
            Choose the billing model that works best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Pay-per-Use Credits</h3>
                  <p className="text-gray-600">Perfect for occasional users</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• No monthly commitment</li>
                <li>• Pay only for what you use</li>
                <li>• Credits never expire</li>
                <li>• Great for testing the platform</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Monthly Subscription</h3>
                  <p className="text-gray-600">Best value for regular users</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Unlimited usage (Pro & Enterprise)</li>
                <li>• Significant cost savings</li>
                <li>• Premium features included</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I switch plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens to unused credits?</h4>
              <p className="text-gray-600 text-sm">Credits never expire and remain in your account. If you switch to a subscription, you can still use your remaining credits.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee for all subscription plans. Credit purchases are non-refundable.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">New users receive 100 free credits to try our platform. You can also start with our Basic plan and upgrade anytime.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="w-6 h-6 mr-2 text-purple-600" />
              Confirm Subscription Upgrade
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  You're about to upgrade to the <strong>{selectedPlan.name}</strong> plan for <strong>${selectedPlan.price}/month</strong>.
                  <br /><br />
                  This will give you access to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedPlan.features?.slice(0, 4).map((feature: string, index: number) => (
                      <li key={index} className="text-sm">{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={upgradeMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUpgrade}
              disabled={upgradeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {upgradeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Upgrade to ${selectedPlan?.name}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? 
              <br /><br />
              <strong>What happens when you cancel:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Your subscription will remain active until {user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'the end of your billing period'}</li>
                <li>You'll lose access to premium features after expiration</li>
                <li>Your account and data will be preserved</li>
                <li>You can reactivate anytime</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Subscription
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}