'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, User } from 'lucide-react';

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  email: string;
  imageUrl?: string;
};

const getBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-slate-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return null;
  }
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // We need to ensure localStorage is accessed only on the client side.
    if (typeof window !== 'undefined') {
        const storedLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
        const sortedUsers = Object.entries(storedLeaderboard)
          .sort(([, a]: any, [, b]: any) => b.points - a.points)
          .map(([email, userData]: [string, any], index) => {
             const userProfile = JSON.parse(localStorage.getItem(`userProfile_${email}`) || '{}');
             return {
                ...userData,
                email,
                rank: index + 1,
                imageUrl: userProfile.imageUrl,
             }
          });
        setLeaderboardData(sortedUsers);
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the SMEC Battle Code arena.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((user: LeaderboardEntry) => (
                  <TableRow key={user.rank} className="font-medium">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getBadge(user.rank)}
                        <span>{user.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                           <AvatarImage src={user.imageUrl} alt={user.name} />
                          <AvatarFallback>
                            <User />
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{user.points.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <h3 className="text-xl font-semibold">The leaderboard is empty.</h3>
              <p>Complete some challenges to get on the board!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
