import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearning } from '@/contexts/LearningContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { Flame, Trophy, Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Progress() {
  const { userProgress, loading } = useLearning();

  // Default values when userProgress is null/loading
  const progress = userProgress || {
    currentStreak: 0,
    longestStreak: 0,
    totalMinutesLearned: 0,
    averageScore: 0,
    dailyProgress: [],
    weakConcepts: []
  };

  const stats = [
    { icon: Flame, label: 'Current Streak', value: `${progress.currentStreak || 0} days`, color: 'text-orange-500' },
    { icon: Trophy, label: 'Best Streak', value: `${progress.longestStreak || 0} days`, color: 'text-yellow-500' },
    { icon: Clock, label: 'Total Time', value: `${Math.round((progress.totalMinutesLearned || 0) / 60)}h`, color: 'text-primary' },
    { icon: BookOpen, label: 'Avg Score', value: `${progress.averageScore || 0}%`, color: 'text-success' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (<DashboardLayout>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-none flex items-center justify-center border border-black ${stat.color} bg-transparent`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Minutes learned per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress.dailyProgress}>
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    contentStyle={{ borderRadius: '0px', border: '2px solid black', boxShadow: '4px 4px 0px 0px #000' }}
                  />
                  <Bar dataKey="minutesLearned" fill="black" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Trend */}
        <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          <CardHeader>
            <CardTitle>Concepts Completed</CardTitle>
            <CardDescription>Daily progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.dailyProgress}>
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ borderRadius: '0px', border: '2px solid black', boxShadow: '4px 4px 0px 0px #000' }}
                  />
                  <Line type="monotone" dataKey="conceptsCompleted" stroke="black" strokeWidth={2} dot={{ fill: 'white', stroke: 'black', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weak Areas */}
      {progress.weakConcepts && progress.weakConcepts.length > 0 && (<Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-black" />
            Areas to Improve
          </CardTitle>
          <CardDescription>Based on your assessment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {progress.weakConcepts.map((concept) => (<span key={concept} className="px-3 py-1 border border-black text-black rounded-none text-sm bg-transparent">
              {concept}
            </span>))}
          </div>
        </CardContent>
      </Card>)}
    </div>
  </DashboardLayout>);
}
