import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useLearning } from '@/contexts/LearningContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { learningGoals } from '@/data/constants';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
const skillLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out, little to no experience' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience, know the basics' },
  { value: 'advanced', label: 'Advanced', description: 'Solid experience, looking to master' },
];
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const { completeOnboarding, authFetch } = useAuth();
  const { generateRoadmap, courses } = useLearning();
  const navigate = useNavigate();
  const totalSteps = 2; // Reduced from 3
  const progress = (step / totalSteps) * 100;
  // toggleItem removed as it's no longer needed

  const handleGenerate = async () => {
    setIsGenerating(true);

    const onboardingData = {
      skillLevel,
      // knownLanguages/Tools removed
      learningGoal: selectedGoal,
      dailyMinutes,
    };
    completeOnboarding(onboardingData);

    // Map goal ID to actual topic for AI
    const topicMap = {
      'react': 'React Development',
      'python-dsa': 'Python Data Structures and Algorithms',
      'web-basics': 'Web Development HTML CSS JavaScript',
      'fullstack': 'Full Stack Web Development',
      'mobile': 'Mobile App Development',
      'ml': 'Machine Learning Python',
      'custom': customTopic,
    };
    const topic = topicMap[selectedGoal] || selectedGoal;

    if (!topic || (selectedGoal === 'custom' && !customTopic.trim())) {
      return; // specific validation for custom topic
    }

    try {
      const roadmap = await generateRoadmap(topic, skillLevel);
      navigate('/roadmap');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      // Fallback: navigate to courses page if AI fails
      setTimeout(() => navigate('/learn'), 2000);
    } finally {
      setIsGenerating(false);
    }
  };
  return (<PublicLayout showFooter={false}>
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl rounded-none border-2 border-black shadow-[8px_8px_0px_0px_#000]">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            <Progress value={progress} className="w-32 h-2" />
          </div>
          <CardTitle className="font-heading text-2xl">
            {step === 1 && "What's your skill level?"}
            {step === 2 && "What do you want to learn?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "This helps us customize your learning path."}
            {step === 2 && "Choose your primary learning goal."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {step === 1 && (<div className="grid gap-3">
                {skillLevels.map((level) => (<div key={level.value} onClick={() => setSkillLevel(level.value)} className={cn('p-4 rounded-none border-2 cursor-pointer transition-all', skillLevel === level.value ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_#000] -translate-y-[2px] -translate-x-[2px]' : 'border-black bg-white hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:border-black')}>
                  <h3 className="font-medium">{level.label}</h3>
                  <p className={cn("text-sm", skillLevel === level.value ? "text-gray-300" : "text-muted-foreground")}>{level.description}</p>
                </div>))}
              </div>)}

              {/* Step 2 (Old Step 3) moved out of condition block or re-indexed */}

              {step === 2 && (<div className="space-y-6">
                <div className="grid gap-3">
                  {learningGoals.map((goal) => (<div key={goal.id} onClick={() => setSelectedGoal(goal.id)} className={cn('p-4 rounded-none border-2 cursor-pointer transition-all', selectedGoal === goal.id ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_#000] -translate-y-[2px] -translate-x-[2px]' : 'border-black bg-white hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:border-black')}>
                    <h3 className="font-medium">{goal.label}</h3>
                    <p className={cn("text-sm", selectedGoal === goal.id ? "text-gray-300" : "text-muted-foreground")}>{goal.description}</p>
                  </div>))}

                  {selectedGoal === 'custom' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                      <Input
                        placeholder="e.g. Quantum Physics, Advanced Pottery, Rust for Beginners..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_#000] focus-visible:ring-0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Be specific! The AI will generate a roadmap based on this.</p>
                    </motion.div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-3">Daily learning time: {dailyMinutes} minutes</h4>
                  <Slider value={[dailyMinutes]} onValueChange={([v]) => setDailyMinutes(v)} min={15} max={120} step={15} />
                </div>
              </div>)}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="rounded-none hover:bg-black/5">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < totalSteps ? (<Button onClick={() => setStep(s => s + 1)} className="rounded-none border-2 border-black bg-black text-white hover:bg-black/90 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>) : (<Button onClick={handleGenerate} disabled={!selectedGoal || isGenerating || (selectedGoal === 'custom' && !customTopic.trim())} className="rounded-none border-2 border-black bg-black text-white hover:bg-black/90 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-full sm:w-auto">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Roadmap
            </Button>)}
          </div>
        </CardContent>
      </Card>


    </div>
  </PublicLayout>);
}
