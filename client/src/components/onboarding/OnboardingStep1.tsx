import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Clock, Target } from 'lucide-react';

export default function OnboardingStep1() {
  return (
    <div className="text-center space-y-8">
      <CardHeader className="pb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Tell us a bit about yourself
        </CardTitle>
        <CardDescription className="text-lg mt-4 max-w-md mx-auto">
          This helps us customize your dashboard and suggestions to match your needs perfectly.
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center space-y-3 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="p-3 bg-purple-500 rounded-full">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-purple-800 dark:text-purple-300">Quick Setup</h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 text-center">
            Takes less than 1 minute to complete
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
          <div className="p-3 bg-pink-500 rounded-full">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-pink-800 dark:text-pink-300">Personalized</h3>
          <p className="text-sm text-pink-600 dark:text-pink-400 text-center">
            Tailored features based on your goals
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl">
          <div className="p-3 bg-indigo-500 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">Smart Suggestions</h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 text-center">
            AI-powered recommendations just for you
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Ready to unlock your social media potential?
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We'll guide you through a few simple questions to get you started.
        </p>
      </div>
    </div>
  );
}