import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

// Payment gateway interfaces
export interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  amount: number;
  credits: number;
  gateway: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

// Abstract payment gateway base class
abstract class PaymentGateway {
  abstract processPayment(data: PaymentData): Promise<PaymentResult>;
  abstract validateCredentials(): boolean;
}

// Stripe Payment Gateway
class StripeGateway extends PaymentGateway {
  private stripe: Stripe | null = null;

  constructor() {
    super();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  validateCredentials(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    if (!this.stripe) {
      return {
        success: false,
        error: "Stripe not configured - missing STRIPE_SECRET_KEY",
      };
    }

    try {
      // Create payment method
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: "card",
        card: {
          number: data.cardNumber.replace(/\s/g, ""),
          exp_month: parseInt(data.expiryMonth),
          exp_year: parseInt(data.expiryYear),
          cvc: data.cvv,
        },
        billing_details: {
          name: data.cardholderName,
          address: {
            line1: data.billingAddress.street,
            city: data.billingAddress.city,
            state: data.billingAddress.state,
            postal_code: data.billingAddress.postalCode,
            country: data.billingAddress.country,
          },
        },
      });

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: "usd",
        payment_method: paymentMethod.id,
        confirm: true,
        return_url: "https://your-app.com/return",
        metadata: {
          credits: data.credits.toString(),
          gateway: "stripe",
        },
      });

      return {
        success: paymentIntent.status === "succeeded",
        transactionId: paymentIntent.id,
        gatewayResponse: paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// PayPal Payment Gateway (Mock implementation - requires PayPal SDK)
class PayPalGateway extends PaymentGateway {
  validateCredentials(): boolean {
    return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Mock implementation - in production, use PayPal REST API
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "PayPal credentials not configured",
      };
    }

    try {
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        transactionId: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "paypal",
          amount: data.amount,
          credits: data.credits,
          status: "completed",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Payrexx Payment Gateway (Mock implementation)
class PayrexxGateway extends PaymentGateway {
  validateCredentials(): boolean {
    return !!(process.env.PAYREXX_API_KEY && process.env.PAYREXX_INSTANCE);
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "Payrexx credentials not configured",
      };
    }

    try {
      // Mock Payrexx API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        transactionId: `PR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "payrexx",
          amount: data.amount,
          credits: data.credits,
          status: "completed",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// MangoPay Payment Gateway (Mock implementation)
class MangoPayGateway extends PaymentGateway {
  validateCredentials(): boolean {
    return !!(process.env.MANGOPAY_CLIENT_ID && process.env.MANGOPAY_API_KEY);
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "MangoPay credentials not configured",
      };
    }

    try {
      // Mock MangoPay API call
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      return {
        success: true,
        transactionId: `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "mangopay",
          amount: data.amount,
          credits: data.credits,
          status: "completed",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Payment gateway factory
export class PaymentGatewayFactory {
  private static gateways: { [key: string]: PaymentGateway } = {
    stripe: new StripeGateway(),
    paypal: new PayPalGateway(),
    payrexx: new PayrexxGateway(),
    mangopay: new MangoPayGateway(),
  };

  static getGateway(gatewayName: string): PaymentGateway {
    const gateway = this.gateways[gatewayName];
    if (!gateway) {
      throw new Error(`Unsupported payment gateway: ${gatewayName}`);
    }
    return gateway;
  }

  static getSupportedGateways(): string[] {
    return Object.keys(this.gateways);
  }

  static getAvailableGateways(): { name: string; available: boolean; reason?: string }[] {
    return Object.entries(this.gateways).map(([name, gateway]) => {
      const available = gateway.validateCredentials();
      return {
        name,
        available,
        reason: available ? undefined : `${name.toUpperCase()} credentials not configured`,
      };
    });
  }
}

// Utility functions
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  return /^\d{13,19}$/.test(cleaned);
}

export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

export function validateExpiryDate(month: string, year: string): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
}