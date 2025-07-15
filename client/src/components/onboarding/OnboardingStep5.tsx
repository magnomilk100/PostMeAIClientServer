import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Calendar, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Clock
} from 'lucide-react';

interface OnboardingStep5Props {
  data: any;
  updateData: (data: any) => void;
}

const goals = [
  {
    id: 'publish',
    title: 'Publish posts on multiple channels',
    description: 'Cross-platform publishing with one click',
    icon: Send,
    color: 'bg-purple-500'
  },
  {
    id: 'schedule',
    title: 'Schedule content in advance',
    description: 'Plan and automate your posting schedule',
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    id: 'engage',
    title: 'Engage with comments & messages',
    description: 'Manage interactions across all platforms',
    icon: MessageCircle,
    color: 'bg-green-500'
  },
  {
    id: 'analyze',
    title: 'Analyze performance metrics',
    description: 'Track engagement and optimize content',
    icon: BarChart3,
    color: 'bg-orange-500'
  },
  {
    id: 'collaborate',
    title: 'Collaborate with my team',
    description: 'Work together on content creation',
    icon: Users,
    color: 'bg-pink-500'
  },
  {
    id: 'ai-content',
    title: 'Generate AI-powered content',
    description: 'Create engaging posts with AI assistance',
    icon: Zap,
    color: 'bg-indigo-500'
  },
  {
    id: 'automation',
    title: 'Automate content workflows',
    description: 'Set up automated posting templates',
    icon: Target,
    color: 'bg-teal-500'
  },
  {
    id: 'consistency',
    title: 'Maintain consistent posting',
    description: 'Keep your audience engaged regularly',
    icon: Clock,
    color: 'bg-emerald-500'
  }
];

export default function OnboardingStep5({ data, updateData }: OnboardingStep5Props) {
  const selectedGoals = data.primaryGoals || [];
  
  const handleGoalToggle = (goalId: string) => {
    const currentGoals = data.primaryGoals || [];
    let newGoals;
    
    if (currentGoals.includes(goalId)) {
      newGoals = currentGoals.filter((id: string) => id !== goalId);
    } else {
      if (currentGoals.length < 3) {
        newGoals = [...currentGoals, goalId];
      } else {
        return; // Don't allow more than 3 selections
      }
    }
    
    updateData({ primaryGoals: newGoals });
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Primary Goals</CardTitle>
        <CardDescription className="text-lg">
          What's your main reason for using PostMeAI? (Select up to 3)
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Selected Goals
          </span>
          <Badge variant={selectedGoals.length === 0 ? "secondary" : "default"}>
            {selectedGoals.length}/3
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            const isDisabled = !isSelected && selectedGoals.length >= 3;
            
            return (
              <Button
                key={goal.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 justify-start text-left transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                    : isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
                onClick={() => !isDisabled && handleGoalToggle(goal.id)}
                disabled={isDisabled}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : goal.color}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{goal.title}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      {goal.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
              Your goals help us prioritize features
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Based on your selection, we'll highlight the most relevant tools and provide personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}