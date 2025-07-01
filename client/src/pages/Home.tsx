import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Bot, Calendar, TrendingUp, Globe, FileText, Target, Headphones, Users, Building2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('common');

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-purple-300/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-10 left-20 w-10 h-10 bg-blue-300/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-8 right-32 w-14 h-14 bg-pink-300/10 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
          
          {/* Beautiful Social Media Post Icons */}
          <div className="absolute top-16 right-10 w-20 h-20 animate-float opacity-20" style={{animationDelay: '0.8s'}}>
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 fill-current">
              <rect x="10" y="20" width="80" height="60" rx="8" fill="currentColor" />
              <circle cx="25" cy="35" r="5" fill="rgba(255,255,255,0.6)" />
              <rect x="35" y="32" width="40" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
              <rect x="35" y="42" width="30" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
              <rect x="15" y="55" width="70" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
              <rect x="15" y="62" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
          
          <div className="absolute bottom-20 left-10 w-16 h-16 animate-float opacity-20" style={{animationDelay: '1.2s'}}>
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/30 fill-current">
              <path d="M20 30 L80 30 L50 55 Z" fill="currentColor" />
              <rect x="15" y="30" width="70" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
        </div>
        
        <div className="page-content-narrow relative z-10">
          <div className="text-center">
            <div className="animate-fadeInUp stagger-animation stagger-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </h1>
            </div>
            
            <div className="animate-fadeInUp stagger-animation stagger-2">
              <p className="text-base md:text-lg lg:text-xl mb-8 opacity-90 px-4 max-w-2xl mx-auto leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
            </div>
            
            <div className="animate-fadeInUp stagger-animation stagger-3">
              <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                <Button 
                  size="lg"
                  className="btn-modern text-white font-semibold px-6 py-3 text-base w-full sm:w-auto animate-pulse-glow"
                  onClick={() => setLocation("/post")}
                >
                  {t('home.hero.createButton')}
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass-card border-2 border-white/30 text-white bg-transparent hover:bg-white/20 backdrop-blur-md transition-all duration-300 px-6 py-3 text-base w-full sm:w-auto interactive-hover"
                  onClick={() => setLocation("/watch-demo")}
                >
                  {t('home.hero.demoButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent dark:from-gray-900/50"></div>
        
        <div className="page-content-narrow relative z-10">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('home.whatIs.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {t('home.whatIs.description')}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="modern-card shadow-2xl overflow-hidden">
            <AccordionItem value="creators" className="border-b border-gray-100 dark:border-gray-700">
              <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('home.forCreators.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Save time with AI-powered content generation</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6">
                <div className="pl-18 space-y-3">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <li key={index} className="flex items-start space-x-3 animate-fadeInUp stagger-animation" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{t(`home.forCreators.items.${index}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="businesses" className="border-b-0">
              <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 gradient-success rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('home.forBusinesses.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Scale your marketing efforts efficiently</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6">
                <div className="pl-18 space-y-3">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <li key={index} className="flex items-start space-x-3 animate-fadeInUp stagger-animation" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{t(`home.forBusinesses.items.${index}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 py-12 md:py-16 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 opacity-50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center animate-fadeInUp stagger-animation stagger-1">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">7+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">Social Platforms</div>
            </div>
            <div className="text-center animate-fadeInUp stagger-animation stagger-2">
              <div className="w-16 h-16 gradient-success rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-1">1M+</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">Posts Created</div>
            </div>
            <div className="text-center animate-fadeInUp stagger-animation stagger-3">
              <div className="w-16 h-16 gradient-warning rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent mb-1">99%</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">Success Rate</div>
            </div>
            <div className="text-center animate-fadeInUp stagger-animation stagger-4">
              <div className="w-16 h-16 gradient-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent mb-1">24/7</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Discover the tools that make PostMeAI the ultimate social media management platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="modern-card p-8 interactive-hover animate-fadeInUp stagger-animation stagger-1 border border-blue-100 dark:border-blue-900/30">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Bot className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Content</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Generate engaging content automatically with our advanced AI algorithms that understand your brand voice.</p>
            </div>
            
            <div className="modern-card p-8 interactive-hover animate-fadeInUp stagger-animation stagger-2 border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Calendar className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Smart Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Schedule posts across multiple platforms with optimal timing based on audience engagement patterns.</p>
            </div>
            
            <div className="modern-card p-8 interactive-hover animate-fadeInUp stagger-animation stagger-3 border border-purple-100 dark:border-purple-900/30">
              <div className="w-16 h-16 gradient-warning rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <TrendingUp className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Track performance metrics and gain actionable insights to optimize your content strategy effectively.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
