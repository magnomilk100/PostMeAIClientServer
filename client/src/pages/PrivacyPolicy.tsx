import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600">
            Effective Date: June 26, 2025 | Last Updated: June 26, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
              Our Commitment to Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              At PostMeAI, we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our social media management platform. Please read this policy carefully to understand 
              our practices regarding your personal data.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Name, email address, and profile information</li>
                <li>Account credentials and authentication data</li>
                <li>Social media account information you choose to connect</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content and Usage Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Posts, images, and content you create or upload</li>
                <li>Publishing schedules and preferences</li>
                <li>Usage patterns and feature interactions</li>
                <li>Device information and browser data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and technical information</li>
                <li>Performance and analytics data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Provision</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Generate AI-powered social media content</li>
                  <li>Schedule and publish posts to connected platforms</li>
                  <li>Provide analytics and performance insights</li>
                  <li>Maintain and improve our services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Send service updates and notifications</li>
                  <li>Respond to customer support inquiries</li>
                  <li>Share important product announcements</li>
                  <li>Provide educational content and tips</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal and Security</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Comply with legal obligations</li>
                  <li>Protect against fraud and abuse</li>
                  <li>Enforce our terms of service</li>
                  <li>Ensure platform security and integrity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-purple-600" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Providers</h3>
                <p className="text-gray-700">We work with trusted third-party providers for hosting, analytics, payment processing, and customer support. These providers are bound by strict confidentiality agreements.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media Platforms</h3>
                <p className="text-gray-700">When you connect your social media accounts, we share content according to your publishing preferences. This is essential for our core service functionality.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <p className="text-gray-700">We may disclose information when required by law, court order, or to protect our rights, users, or public safety.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Data Security and Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure database storage with regular backups</li>
                <li>Multi-factor authentication options</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee access controls and training</li>
                <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a standard format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
                <li><strong>Withdraw Consent:</strong> Revoke previously given permissions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">We use cookies and similar technologies to enhance your experience:</p>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700">Required for basic website functionality, authentication, and security.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-700">Help us understand how you use our service to improve performance.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-gray-700">Remember your settings and preferences for a personalized experience.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              PostMeAI is a global service. Your information may be transferred to and processed in 
              countries other than your own. We ensure appropriate safeguards are in place through 
              standard contractual clauses, adequacy decisions, and other legal mechanisms to protect 
              your data during international transfers.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              PostMeAI is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices 
              or for legal, operational, or regulatory reasons. We will notify you of any material 
              changes by email or through our service. Your continued use of PostMeAI after changes 
              become effective constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-purple-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@postmeai.com</p>
                  <p><strong>Address:</strong> PostMeAI Privacy Office</p>
                  <p>123 Innovation Drive, Suite 456</p>
                  <p>Tech Valley, CA 94000, United States</p>
                  <p><strong>Response Time:</strong> We aim to respond within 30 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">
            This Privacy Policy is part of our Terms of Service and governs your use of PostMeAI.
          </p>
          <Link href="/">
            <Button className="mt-4">
              Return to PostMeAI
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}