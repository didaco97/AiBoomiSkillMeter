import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLearning } from '@/contexts/LearningContext';
import { PlayCircle, FileText, CheckCircle2, Circle, Clock, ArrowRight, Download, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Certificate from '@/components/Certificate';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

export default function Roadmap() {
  const { currentRoadmap, selectConcept } = useLearning();
  const { user } = useAuth();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!currentRoadmap) return;

    setIsGenerating(true);
    setShowCertificate(true);

    // Wait for the certificate to render
    setTimeout(async () => {
      try {
        if (certificateRef.current) {
          const canvas = await html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const link = document.createElement('a');
          link.download = `SkillMeter_Certificate_${currentRoadmap.course.title.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      } catch (error) {
        console.error('Certificate generation error:', error);
        alert('Could not generate certificate. Please try again.');
      } finally {
        setIsGenerating(false);
        setShowCertificate(false);
      }
    }, 500);
  };

  // Generate certificate data
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Learner';
  const courseTitle = currentRoadmap?.course?.title || 'Course';
  const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certificateId = currentRoadmap ? `SM-${currentRoadmap.id}-${Date.now().toString(36).toUpperCase()}` : 'SM-XXX';

  if (!currentRoadmap) {
    return (<DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="font-heading text-2xl font-bold mb-2">No Roadmap Yet</h2>
        <p className="text-muted-foreground mb-6">Complete the onboarding to get your personalized roadmap.</p>
        <Button onClick={() => navigate('/onboarding')}>Get Started</Button>
      </div>
    </DashboardLayout>);
  }
  const { course, progress } = currentRoadmap;
  return (<DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6">
        <img src={course.thumbnail} alt={course.title} className="w-full lg:w-64 h-40 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="capitalize">{course.difficulty}</Badge>
            <Badge variant="outline">{course.estimatedHours}h</Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-2">
              {progress === 100 && (
                <Button
                  onClick={handleDownloadCertificate}
                  variant="outline"
                  className="border-2 border-black hover:bg-black hover:text-white transition-all"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Certificate
                </Button>
              )}
              <Button onClick={() => navigate('/learn')}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapters */}
      <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
        <CardHeader>
          <CardTitle>Course Outline</CardTitle>
          <CardDescription>{course.chapters.length} chapters • {course.chapters.reduce((acc, ch) => acc + ch.concepts.length, 0)} concepts</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4">
            {course.chapters.map((chapter, chapterIndex) => {
              const completedConcepts = chapter.concepts.filter(c => c.completed).length;
              const chapterProgress = Math.round((completedConcepts / chapter.concepts.length) * 100);
              return (<AccordionItem key={chapter.id} value={chapter.id} className="border-2 border-black rounded-none px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn('h-8 w-8 rounded-none border border-black flex items-center justify-center text-sm font-medium', chapterProgress === 100 ? 'bg-black text-white' : 'bg-transparent text-black')}>
                      {chapterProgress === 100 ? <CheckCircle2 className="h-4 w-4" /> : chapterIndex + 1}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold">{chapter.title}</h3>
                      <p className="text-sm text-muted-foreground">{completedConcepts}/{chapter.concepts.length} completed</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-2 ml-12">
                    {chapter.concepts.map((concept, conceptIndex) => (<div key={concept.id} onClick={() => { selectConcept(chapterIndex, conceptIndex); navigate('/learn'); }} className={cn('flex items-center gap-3 p-3 rounded-none border border-transparent hover:border-black cursor-pointer transition-all', concept.completed ? 'bg-black/5' : 'hover:bg-transparent')}>
                      {concept.completed ? (<CheckCircle2 className="h-5 w-5 text-black" />) : (<Circle className="h-5 w-5 text-muted-foreground" />)}
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", concept.completed && "line-through text-muted-foreground")}>{concept.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {concept.duration} min
                        </div>
                      </div>
                      {concept.type === 'video' && <PlayCircle className="h-4 w-4 text-muted-foreground" />}
                      {concept.type === 'reading' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    </div>))}
                  </div>
                </AccordionContent>
              </AccordionItem>);
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Hidden Certificate for html2canvas capture */}
      {showCertificate && (
        <div className="fixed top-[-9999px] left-[-9999px]">
          <Certificate
            ref={certificateRef}
            userName={userName}
            courseTitle={courseTitle}
            completionDate={completionDate}
            certificateId={certificateId}
          />
        </div>
      )}
    </div>
  </DashboardLayout>);
}
