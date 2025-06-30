import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Bot, Calendar, TrendingUp, Globe, FileText, Target, Headphones, Users, Building2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('common');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative gradient-hero text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">{t('home.hero.title')}</h1>
            <p className="text-xl mb-8 opacity-90">{t('home.hero.subtitle')}</p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl transform transition-all duration-300 ease-in-out hover:text-white border-2 border-transparent hover:border-purple-400"
                onClick={() => setLocation("/post")}
              >
                {t('home.hero.createButton')}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors"
                onClick={() => setLocation("/watch-demo")}
              >
                {t('home.hero.demoButton')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-8 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('home.whatIs.title')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('home.whatIs.description')}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
            <AccordionItem value="creators" className="border-b">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('home.forCreators.title')}</h3>
                    <p className="text-sm text-gray-500">Save time with AI-powered content generation</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="pl-13">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <li key={index}>• {t(`home.forCreators.items.${index}`)}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="businesses" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('home.forBusinesses.title')}</h3>
                    <p className="text-sm text-gray-500">Scale your social media marketing effortlessly</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="pl-13">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <li key={index}>• {t(`home.forBusinesses.items.${index}`)}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">7+</div>
              <div className="text-gray-600">Social Platforms</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">1M+</div>
              <div className="text-gray-600">Posts Created</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-800">AI-Powered Content</h3>
              <p className="text-gray-600">Generate engaging content automatically with our advanced AI algorithms.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-emerald-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-emerald-800">Smart Scheduling</h3>
              <p className="text-gray-600">Schedule posts across multiple platforms with optimal timing.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-800">Analytics & Insights</h3>
              <p className="text-gray-600">Track performance and optimize your content strategy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
