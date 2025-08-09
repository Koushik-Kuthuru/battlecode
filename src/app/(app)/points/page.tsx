'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function PointsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Scoring System
          </CardTitle>
          <CardDescription>
            Understand how to climb the ranks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>
                A score is awarded for each challenge you solve correctly by passing all the test cases. The number of points you receive is based on the difficulty of the challenge.
            </p>
            <ul className="space-y-3 list-disc list-inside">
                <li>
                    <strong className="text-green-500">Easy Challenges:</strong> Award <span className="font-bold">10</span> for completion. These are great for getting started and understanding fundamental concepts.
                </li>
                <li>
                    <strong className="text-yellow-500">Medium Challenges:</strong> Award <span className="font-bold">25</span> for completion. These problems require a solid understanding of algorithms and data structures.
                </li>
                 <li>
                    <strong className="text-red-500">Hard Challenges:</strong> Award <span className="font-bold">50</span> for completion. These are complex problems that will truly test your problem-solving abilities.
                </li>
            </ul>
            <p>
                Your total score is reflected on the leaderboard. Keep solving to increase your score and prove your skills!
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
