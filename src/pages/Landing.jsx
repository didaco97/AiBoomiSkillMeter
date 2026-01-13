import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Target, BarChart3, Zap } from 'lucide-react';
import Testimonials from '@/components/ui/twitter-testimonial-cards';
import { ReviewForm } from '@/components/ui/review-form';
import { Particles } from '@/components/ui/particles';
import { RetroGrid } from '@/components/ui/retro-grid';
import { LetterSwapForward } from '@/components/ui/letter-swap';
import { RocketLaunch } from '@/components/ui/rocket-launch';

const features = [
  { icon: Target, title: 'Personalized Roadmaps', description: 'AI creates a custom learning path based on your goals and experience level.' },
  { icon: BookOpen, title: 'Curated Free Content', description: 'Learn from the best free resources, organized into structured lessons.' },
  { icon: BarChart3, title: 'Track Your Progress', description: 'Visual analytics to monitor your growth and identify weak areas.' },
  { icon: Zap, title: 'Smart Assessments', description: 'AI-powered quizzes that adapt to reinforce your learning.' },
];
const steps = [
  { step: '01', title: 'Tell Us Your Goal', description: 'Share what you want to learn and your current skill level.' },
  { step: '02', title: 'Get Your Roadmap', description: 'AI generates a personalized learning path just for you.' },
  { step: '03', title: 'Learn Daily', description: 'Watch videos, read notes, and complete assessments.' },
  { step: '04', title: 'Track & Improve', description: 'Monitor progress and master concepts through practice.' },
];
export default function Landing() {
  const navigate = useNavigate();
  return (<PublicLayout>
    {/* Hero Section */}
    <section className="relative isolate overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 flex flex-col items-center">
            <LetterSwapForward label="Turn free content into a" className="mb-2" />
            <span className="gradient-text">structured learning journey</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            SkillMeter uses AI to create personalized roadmaps from the best free resources online.
            Learn systematically, track progress, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/signup')} className="w-full sm:w-auto rounded-none border-2 border-black bg-black text-white hover:bg-black/90 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-auto rounded-none border-2 border-black bg-transparent text-black hover:bg-black/5 hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all">
              Log In
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <Particles
        className="absolute inset-0 -z-10"
        quantity={200}
        ease={80}
        color="#000000"
        refresh
      />

      {/* Rocket Launch Animation */}
      <RocketLaunch />
    </section>

    {/* Retro Grid Background Wrapper for Features & How It Works */}
    <div className="relative">
      <RetroGrid className="-z-10" />

      {/* Features Section */}
      <section id="features" className="py-20 bg-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 flex justify-center">
              <LetterSwapForward label="Everything you need to learn effectively" />
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Powerful features designed to accelerate your learning journey.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (<motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-card p-6 rounded-none border-2 border-black shadow-sm hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all duration-300">
              <div className="h-12 w-12 rounded-none bg-primary/10 border border-black flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 flex justify-center">
              <LetterSwapForward label="How It Works" />
            </h2>
            <p className="text-muted-foreground">Four simple steps to transform your learning.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (<motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <div className="text-5xl font-heading font-bold text-primary/20 mb-4">{step.step}</div>
              <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>))}
          </div>
        </div>
      </section>
    </div>


    {/* CTA Section */}
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 flex justify-center">
          <LetterSwapForward label="Ready to start learning?" className="text-primary-foreground" />
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Join thousands of learners who are achieving their goals with personalized AI-powered roadmaps.
        </p>
        <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>
          Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>

    {/* Loved by Learners (Split Screen) */}
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 flex justify-center">
            <LetterSwapForward label="Loved by Learners" />
          </h2>
          <p className="text-muted-foreground">Join our community and share your story.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-start">
          {/* Left: Testimonials */}
          <div className="flex justify-center lg:justify-end min-h-[400px]">
            <Testimonials />
          </div>

          {/* Right: Review Form */}
          <div className="flex justify-center lg:justify-start">
            <ReviewForm />
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>);
}
