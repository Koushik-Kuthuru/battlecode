
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SmecBattleCodeLogo } from '@/components/icons';
import { ArrowRight, BrainCircuit, Code, Trophy, Calendar, Target, Users } from 'lucide-react';

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

        <section id="about" className="py-20 md:py-32">
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
