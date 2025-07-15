import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Check, Star, Zap, Crown, Building } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      description: "Perfect for individuals and small creators getting started",
      icon: Star,
      popular: false,
      features: [
        "Up to 3 social media accounts",
        "50 posts per month",
        "Basic AI content generation",
        "Standard templates",
        "Email support",
        "Mobile app access",
        "Basic analytics"
      ],
      limitations: [
        "Limited platform integrations",
        "No team collaboration",
        "Basic scheduling features"
      ]
    },
    {
      name: "Pro",
      price: "$79",
      period: "per month",
      description: "Ideal for growing businesses and marketing teams",
      icon: Zap,
      popular: true,
      features: [
        "Up to 10 social media accounts",
        "Unlimited posts",
        "Advanced AI content generation",
        "Premium templates library",
        "Priority email & chat support",
        "Team collaboration (up to 5 users)",
        "Advanced analytics & reporting",
        "Custom branding",
        "Bulk scheduling",
        "Content calendar",
        "Performance insights"
      ],
      limitations: [
        "Advanced enterprise features not included"
      ]
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "per month",
      description: "For large organizations with advanced needs",
      icon: Crown,
      popular: false,
      features: [
        "Unlimited social media accounts",
        "Unlimited posts",
        "Enterprise AI features",
        "Custom templates & branding",
        "24/7 priority support",
        "Unlimited team members",
        "Advanced analytics & reporting",
        "White-label options",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security features",
        "Compliance reporting",
        "Custom training sessions"
      ],
      limitations: []
    }
  ];

  const features = [
    {
      icon: Building,
      title: "Multi-Platform Management",
      description: "Connect and manage all your social media accounts from one dashboard"
    },
    {
      icon: Zap,
      title: "AI-Powered Content",
      description: "Generate engaging content with advanced AI technology"
    },
    {
      icon: Star,
      title: "Advanced Analytics",
      description: "Track performance and optimize your social media strategy"
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or refunded accordingly."
    },
    {
      question: "What happens if I exceed my monthly post limit?",
      answer: "For Basic and Pro plans, you'll be notified when approaching limits. You can either upgrade your plan or purchase additional posts as needed."
    },
    {
      question: "Do you offer annual billing discounts?",
      answer: "Yes, we offer 20% discount for annual billing on all plans. Contact our sales team for more details."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial for all plans. No credit card required to start your trial."
    },
    {
      question: "What social media platforms do you support?",
      answer: "We support Facebook, Instagram, LinkedIn, TikTok, YouTube, Discord, and Telegram with more platforms being added regularly."
    }
  ];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Choose the perfect plan for your social media needs. All plans include our core features with different limits and capabilities.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge variant="secondary" className="px-3 py-1">
            14-Day Free Trial
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            No Setup Fees
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Cancel Anytime
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`modern-card hover:shadow-lg transition-all duration-300 relative ${
              plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-600 dark:text-purple-400'
                }`}>
                  <plan.icon className="w-8 h-8" />
                </div>
              </div>
              
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold mb-2">
                {plan.price}
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                  /{plan.period}
                </span>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">
                  What's included:
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                asChild 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                }`}
              >
                <Link href="/register">
                  Start Free Trial
                </Link>
              </Button>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                No credit card required
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose PostMeAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
                  <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Social Media?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of content creators and businesses who are already using PostMeAI to grow their social media presence. Start your free trial today!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/features">Explore Features</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}