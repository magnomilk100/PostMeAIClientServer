import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Payment form validation schema
const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number too long"),
  expiryMonth: z.string().min(2, "Month required"),
  expiryYear: z.string().min(4, "Year required"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV too long"),
  cardholderName: z.string().min(2, "Cardholder name required"),
  billingAddress: z.object({
    street: z.string().min(1, "Street address required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    postalCode: z.string().min(1, "Postal code required"),
    country: z.string().min(1, "Country required"),
  }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  credits: number;
  onSuccess?: () => void;
}

// Supported payment gateways
const paymentGateways = [
  { id: "stripe", name: "Stripe", description: "Credit/Debit Cards", icon: "💳" },
  { id: "paypal", name: "PayPal", description: "PayPal Account", icon: "🅿️" },
  { id: "payrexx", name: "Payrexx", description: "Swiss Payment Solution", icon: "🇨🇭" },
  { id: "mangopay", name: "MangoPay", description: "European Payment Platform", icon: "🇪🇺" },
];

export default function PaymentForm({ amount, credits, onSuccess }: PaymentFormProps) {
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
    },
  });

  // Payment processing mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData & { gateway: string; amount: number; credits: number }) => {
      return await apiRequest("POST", "/api/payments/process", data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: `Successfully purchased ${credits} credits for $${amount}`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    setIsProcessing(true);
    paymentMutation.mutate({
      ...data,
      gateway: selectedGateway,
      amount,
      credits,
    });
  };

  // Format card number input
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Get card type from number
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "Mastercard";
    if (cleaned.startsWith("3")) return "American Express";
    return "Unknown";
  };

  // Generate expiry years (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const expiryYears = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-6 h-6 mr-2 text-purple-600" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Purchase {credits} credits for ${amount}. Your payment is secure and encrypted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Gateway Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Select Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentGateways.map((gateway) => (
              <div
                key={gateway.id}
                onClick={() => setSelectedGateway(gateway.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedGateway === gateway.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{gateway.icon}</span>
                  <div>
                    <div className="font-medium">{gateway.name}</div>
                    <div className="text-sm text-gray-500">{gateway.description}</div>
                  </div>
                  {selectedGateway === gateway.id && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Card Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Card Details
              </h3>
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="1234 5678 9012 3456"
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={19}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-xs text-gray-500">{getCardType(field.value)}</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = String(i + 1).padStart(2, '0');
                            return (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expiryYears.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123"
                          maxLength={4}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Billing Address</h3>
              
              <FormField
                control={form.control}
                name="billingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billingAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="New York" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="NY" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billingAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="CH">Switzerland</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing || paymentMutation.isPending}
              size="lg"
            >
              {isProcessing || paymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay ${amount} Securely
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-500">
              <Lock className="w-4 h-4 inline mr-1" />
              Your payment information is encrypted and secure
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}