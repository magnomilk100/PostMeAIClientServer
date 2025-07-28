import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Users, Globe } from 'lucide-react';

export default function TermsOfUse() {
  const [, setLocation] = useLocation();

  return (
    <div className="page-content-narrow">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Terms of Use
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Effective Date: January 26, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to PostMeAI. These Terms of Use ("Terms") govern your use of the PostMeAI 
              platform and services ("Service") operated by PostMeAI ("we," "us," or "our").
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using our Service, you agree to be bound by these Terms. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              PostMeAI is an AI-powered social media content management platform that enables users to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Generate AI-powered content for social media platforms</li>
              <li>Schedule and publish posts across multiple social media channels</li>
              <li>Manage teams and workspaces for collaborative content creation</li>
              <li>Analyze content performance and engagement metrics</li>
              <li>Store and organize media assets and templates</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              User Accounts and Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Registration</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You must create an account to use certain features of our Service. You are responsible 
                for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accurate Information</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to provide accurate, current, and complete information during registration 
                and to update such information to maintain its accuracy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Security</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You are responsible for notifying us immediately of any unauthorized use of your 
                account or any other breach of security.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Post content that is illegal, harmful, threatening, abusive, or discriminatory</li>
              <li>Engage in spam, phishing, or other fraudulent activities</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Upload content that contains viruses, malware, or other malicious code</li>
              <li>Infringe upon intellectual property rights of others</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </CardContent>
        </Card>

        {/* Content and Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Content and Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Content</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You retain ownership of content you create, upload, or share through the Service. 
                By using the Service, you grant us a non-exclusive, worldwide, royalty-free license 
                to use, modify, and distribute your content solely for the purpose of providing the Service.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Generated Content</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Content generated by our AI systems is provided as-is. You are responsible for 
                reviewing, editing, and ensuring the appropriateness of AI-generated content before publication.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Our Intellectual Property</h4>
              <p className="text-gray-700 dark:text-gray-300">
                The Service, including its features, functionality, and technology, is owned by 
                PostMeAI and is protected by intellectual property laws. You may not reproduce, 
                distribute, or create derivative works based on our proprietary technology.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Privacy and Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
              and protect your information when you use the Service. By using the Service, you 
              consent to the collection and use of information in accordance with our Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We implement appropriate security measures to protect your personal information, 
              but you acknowledge that no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        {/* Subscription and Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-600" />
              Subscription and Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Subscription Plans</h4>
              <p className="text-gray-700 dark:text-gray-300">
                We offer various subscription plans with different features and usage limits. 
                Subscription fees are billed in advance on a monthly or annual basis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment and Billing</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to pay all fees associated with your chosen subscription plan. 
                All payments are non-refundable except as expressly stated in these Terms or required by law.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cancellation</h4>
              <p className="text-gray-700 dark:text-gray-300">
                You may cancel your subscription at any time through your account settings. 
                Cancellation will be effective at the end of your current billing period.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Disclaimers and Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Disclaimer</h4>
              <p className="text-gray-700 dark:text-gray-300">
                The Service is provided "as is" and "as available" without warranties of any kind, 
                either express or implied. We do not guarantee that the Service will be 
                uninterrupted, error-free, or completely secure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Limitation of Liability</h4>
              <p className="text-gray-700 dark:text-gray-300">
                To the maximum extent permitted by law, PostMeAI shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including 
                but not limited to loss of profits, data, or business opportunities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Maximum Liability</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Our total liability to you for all claims arising from or relating to these 
                Terms or the Service shall not exceed the amount you paid us in the twelve 
                months preceding the claim.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to terminate or suspend your account and access to the Service 
              at our sole discretion, without notice, if you violate these Terms or engage in 
              conduct that we determine to be harmful to the Service or other users.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, your right to use the Service will cease immediately, and we 
              may delete your account and all associated data after a reasonable notice period.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms at any time. We will notify users of 
              any material changes by posting the updated Terms on our website and updating 
              the "Effective Date" at the top of this document.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Your continued use of the Service after any changes to these Terms constitutes 
              your acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>PostMeAI Support Team</strong><br />
                Email: contact@postmeai.com<br />
                Website: https://postmeai.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}