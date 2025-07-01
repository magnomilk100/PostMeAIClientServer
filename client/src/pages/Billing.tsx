import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Plus, History, DollarSign, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PaymentForm from "@/components/PaymentForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PaymentTransaction } from "@shared/schema";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [creditAmount, setCreditAmount] = useState("50");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Fetch payment transactions from database
  const { data: transactions = [], refetch: refetchTransactions } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/payments/transactions"],
    enabled: !!user,
  });

  const creditPackages = [
    { credits: 50, price: 9.99, popular: false },
    { credits: 100, price: 19.99, popular: true },
    { credits: 250, price: 39.99, popular: false },
    { credits: 500, price: 69.99, popular: false },
  ];

  const handlePurchaseCredits = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSelectedPackage(null);
    
    // Refresh transaction history from database
    refetchTransactions();
    
    // Refresh user data to get updated credit balance
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // Show success message
    toast({
      title: "Payment Successful",
      description: "Credits have been added to your account successfully!",
    });
  };

  return (
    <div className="page-content space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Wallet className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
            {t('billing.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{t('billing.subtitle')}</p>
        </div>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
            <DollarSign className="w-6 h-6 mr-2" />
            {t('billing.currentBalance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {user?.subscriptionStatus === 'active' ? t('billing.unlimited') : `${user?.credits || 0} ${t('billing.credits')}`}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {user?.subscriptionStatus === 'active' 
                  ? `${user.subscriptionPlan} Subscription Active`
                  : 'Pay-per-use credits'}
              </p>
            </div>
            {user?.subscriptionStatus !== 'active' && (
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  const creditsTab = document.querySelector('[value="credits"]') as HTMLButtonElement;
                  creditsTab?.click();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits">{t('billing.tabs.purchaseCredits')}</TabsTrigger>
          <TabsTrigger value="history">{t('billing.tabs.transactionHistory')}</TabsTrigger>
        </TabsList>

        {/* Credit Packages Tab */}
        <TabsContent value="credits" className="space-y-6">
          {/* Custom Amount */}
          <Card>
            <CardHeader>
              <CardTitle>{t('billing.customPurchase.title')}</CardTitle>
              <CardDescription>{t('billing.customPurchase.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Label htmlFor="credit-amount">{t('billing.customPurchase.label')}</Label>
                  <Input
                    id="credit-amount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    min="10"
                    max="1000"
                  />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${(parseInt(creditAmount || "0") * 0.2).toFixed(2)}
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => handlePurchaseCredits({
                    credits: parseInt(creditAmount || "0"),
                    price: parseFloat((parseInt(creditAmount || "0") * 0.2).toFixed(2))
                  })}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">$0.20 per credit</p>
            </CardContent>
          </Card>

          {/* Preset Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.map((pkg) => (
              <Card key={pkg.credits} className={`relative ${pkg.popular ? 'border-purple-500 ring-2 ring-purple-200' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    {t('billing.creditPackages.popular')}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl dark:text-white">{t('billing.creditPackages.credits', { credits: pkg.credits })}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">${pkg.price}</div>
                  <CardDescription className="dark:text-gray-400">${(pkg.price / pkg.credits).toFixed(3)} per credit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handlePurchaseCredits(pkg)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('billing.creditPackages.buy')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Credit Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5 Credits</div>
                  <p className="text-gray-600 dark:text-gray-300">AI Post Generation</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3 Credits</div>
                  <p className="text-gray-600 dark:text-gray-300">Image Generation</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1 Credit</div>
                  <p className="text-gray-600 dark:text-gray-300">Post Scheduling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Transaction History
              </CardTitle>
              <CardDescription>View all your credit purchases and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction: PaymentTransaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Credit Purchase - {transaction.gateway.toUpperCase()}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          +{transaction.credits} Credits
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">${transaction.amount}</div>
                        <Badge variant={transaction.status === 'completed' ? 'default' : transaction.status === 'failed' ? 'destructive' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Purchase credits to see your transaction history here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              {selectedPackage && (
                <>Purchase {selectedPackage.credits} credits for ${selectedPackage.price}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <PaymentForm
              amount={selectedPackage.price}
              credits={selectedPackage.credits}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}