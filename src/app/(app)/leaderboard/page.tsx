'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal } from 'lucide-react';

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
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
        const sortedUsers = Object.values(storedLeaderboard)
          .sort((a: any, b: any) => b.points - a.points)
          .map((user: any, index) => ({
            ...user,
            rank: index + 1
          }));
        setLeaderboardData(sortedUsers);
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the BattleCode arena.</CardDescription>
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
                           <AvatarImage src={`https://i.pravatar.cc/150?u=${user.name}`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
