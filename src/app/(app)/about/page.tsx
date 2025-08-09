'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-8 w-8 text-primary" />
            About SMEC Battle Code
          </CardTitle>
          <CardDescription>
            The ultimate coding challenge arena for our students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <p>
            Welcome to SMEC Battle Code, the official competitive programming platform of <strong>St. Martin's Engineering College (SMEC)</strong>.
          </p>
          <p>
            This platform is an exclusive space for the students of SMEC to hone their problem-solving skills, compete in coding challenges, and prepare for technical interviews.
          </p>
           <p>
            Sharpen your coding abilities, climb the leaderboard, and become a coding champion!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
