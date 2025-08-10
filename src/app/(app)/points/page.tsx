
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BulletCoin } from '@/components/icons';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PointsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BulletCoin className="h-8 w-8 text-primary" />
            Scoring System
          </CardTitle>
          <CardDescription>
            Understand how to climb the ranks and earn points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <p className="mb-4">
                    A score is awarded for each challenge you solve correctly. To solve a challenge, your submitted code must pass all predefined test cases, including both visible and hidden ones. The number of points you receive is based on the difficulty of the challenge.
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Points Awarded</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <strong className="text-green-500">Easy</strong>
                            </TableCell>
                            <TableCell className="font-bold">10 Points</TableCell>
                            <TableCell>Great for getting started and understanding fundamental concepts.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong className="text-yellow-500">Medium</strong>
                            </TableCell>
                            <TableCell className="font-bold">25 Points</TableCell>
                            <TableCell>Requires a solid understanding of algorithms and data structures.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong className="text-red-500">Hard</strong>
                            </TableCell>
                            <TableCell className="font-bold">50 Points</TableCell>
                            <TableCell>Complex problems that will truly test your problem-solving abilities.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    First-Time Completion
                </h3>
                <p className="text-muted-foreground">
                    You earn points for a specific challenge only on the first time you successfully solve it. You are free to resubmit improved solutions, but this will not grant additional points.
                </p>
            </div>

             <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Integrity and Fair Play
                </h3>
                <p className="text-muted-foreground">
                    Your total score is reflected on the leaderboard. Maintaining academic integrity is crucial. Any violation of the rules may result in a score reset or disqualification.
                </p>
            </div>

            <p className="pt-4 text-center text-lg font-semibold">
                Keep solving to increase your score and prove your skills!
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
