
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SmecBattleCodeLogo } from '@/components/icons';
import { ArrowRight, BrainCircuit, Code, Trophy, Calendar, Target, Users, LogIn, ListChecks, Send, Flame, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto flex items-center justify-between h-20 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SmecBattleCodeLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">SMEC Battle Code</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Sign Up <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center text-center py-20 md:py-32 px-4">
          <div className="animate-fade-in-up">
            <Badge className="mb-4">Exclusive for SMEC Students</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              The Ultimate Arena for Coders
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              Sharpen your skills, compete with peers, and climb the leaderboard. Welcome to the official competitive programming platform of St. Martin's Engineering College.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why SMEC Battle Code?</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                We provide the tools and environment to help you succeed in your coding journey.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-lg shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Code className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-World Challenges</h3>
                <p className="text-muted-foreground">
                  Solve problems that mirror technical interviews at top companies.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-lg shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Compete & Climb</h3>
                <p className="text-muted-foreground">
                  Test your skills against fellow students and earn your spot on the leaderboard.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-lg shadow-md animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Master Key Concepts</h3>
                <p className="text-muted-foreground">
                  Strengthen your understanding of algorithms and data structures.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="how-it-works" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                        Get started in just a few simple steps.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
                        <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                                <LogIn className="h-6 w-6" />
                             </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-1">1. Sign Up / Login</h3>
                                <p className="text-muted-foreground">Create your account or log in using your SMEC student credentials to get started.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                                <ListChecks className="h-6 w-6" />
                             </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-1">2. Choose a Challenge</h3>
                                <p className="text-muted-foreground">Browse through a variety of challenges categorized by difficulty and programming language.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                                <Send className="h-6 w-6" />
                             </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-1">3. Write & Submit Code</h3>
                                <p className="text-muted-foreground">Use our built-in code editor to write, test, and submit your solution for evaluation.</p>
                             </div>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                                <Trophy className="h-6 w-6" />
                             </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-1">4. Climb the Leaderboard</h3>
                                <p className="text-muted-foreground">Earn points for every correct submission and see your name rise to the top of the ranks.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="challenge-highlights" className="bg-muted py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Challenge Highlights</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                Here's a taste of the challenges that await you.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg shadow-md border border-transparent hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Two Sum</h3>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">Easy</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Find two numbers in an array that add up to a specific target.</p>
                </div>
                <div className="p-6 bg-card rounded-lg shadow-md border border-transparent hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Longest Substring</h3>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Medium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Find the length of the longest substring without repeating characters.</p>
                </div>
                <div className="p-6 bg-card rounded-lg shadow-md border border-transparent hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Trapping Rain Water</h3>
                        <Badge variant="outline" className="text-red-500 border-red-500/50">Hard</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Compute how much water an elevation map can trap after raining.</p>
                </div>
            </div>
            <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <Link href="/missions">View All Challenges</Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="leaderboard-preview" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Leaderboard Preview</h2>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                        See who's leading the charge. Can you dethrone them?
                    </p>
                </div>
                <div className="max-w-lg mx-auto">
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-card rounded-lg shadow-md border border-yellow-400">
                            <Trophy className="h-8 w-8 text-yellow-400 mr-4" />
                            <div className="flex-1">
                                <p className="font-bold">Alex Johnson</p>
                                <p className="text-sm text-muted-foreground">1st Place</p>
                            </div>
                            <p className="font-bold text-lg">1,250 PTS</p>
                        </div>
                        <div className="flex items-center p-4 bg-card rounded-lg shadow-md border">
                            <Star className="h-8 w-8 text-slate-400 mr-4" />
                            <div className="flex-1">
                                <p className="font-semibold">Maria Garcia</p>
                                <p className="text-sm text-muted-foreground">2nd Place</p>
                            </div>
                            <p className="font-semibold text-lg">1,180 PTS</p>
                        </div>
                        <div className="flex items-center p-4 bg-card rounded-lg shadow-md border">
                             <Star className="h-8 w-8 text-amber-600 mr-4" />
                            <div className="flex-1">
                                <p className="font-semibold">Sameer Khan</p>
                                <p className="text-sm text-muted-foreground">3rd Place</p>
                            </div>
                            <p className="font-semibold text-lg">1,150 PTS</p>
                        </div>
                    </div>
                </div>
                 <div className="text-center mt-12">
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/leaderboard">View Full Leaderboard</Link>
                    </Button>
                </div>
            </div>
        </section>


        <section id="about" className="bg-muted py-20 md:py-32">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">About the Battle</h2>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                        Everything you need to know about the SMEC coding arena.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 bg-card rounded-lg shadow-md">
                        <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                          <Target className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Our Purpose</h3>
                        <p className="text-muted-foreground">
                            To provide a platform for SMEC students to test their programming skills, compete with peers, and prepare for real-world technical challenges in a fun and engaging way.
                        </p>
                    </div>
                     <div className="p-8 bg-card rounded-lg shadow-md">
                        <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                          <Users className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Who Can Participate?</h3>
                        <p className="text-muted-foreground">
                            Participation is exclusive to the students of St. Martin's Engineering College. This is your personal arena to shine and showcase your talent.
                        </p>
                    </div>
                     <div className="p-8 bg-card rounded-lg shadow-md">
                        <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                          <Calendar className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Events & Timelines</h3>
                        <p className="text-muted-foreground">
                           Stay tuned for regular challenges, workshops, and special coding events. Keep an eye on the dashboard for all upcoming timelines and announcements.
                        </p>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="container mx-auto flex items-center justify-center h-20 px-4 md:px-6">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SMEC Battle Code. All rights reserved.</p>
      </footer>
    </div>
  );
}

// A simple Badge component for the landing page
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ${className}`}>
            {children}
        </div>
    )
}
