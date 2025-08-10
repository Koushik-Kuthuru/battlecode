
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Medal, User } from 'lucide-react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const BRANCH_MAP: Record<string, string> = {
    cse: 'CSE',
    csd: 'CSE (Data Science)',
    cse_aiml: 'CSE (AI & ML)',
    aiml: 'AI & Machine Learning',
    aids: 'AI & Data Science',
    it: 'Info. Tech.',
    ece: 'ECE',
    eee: 'EEE',
    mech: 'Mechanical',
    civil: 'Civil',
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  email: string;
  imageUrl?: string;
  branch?: string;
  year?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('points', 'desc'));
        const querySnapshot = await getDocs(q);

        const sortedUsers: LeaderboardEntry[] = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            rank: index + 1,
            name: data.name,
            points: data.points || 0,
            email: data.email,
            imageUrl: data.imageUrl,
            branch: data.branch ? BRANCH_MAP[data.branch] || data.branch : 'N/A',
            year: data.year ? `${data.year} Year` : 'N/A',
          };
        });
        setLeaderboardData(sortedUsers);
      } catch (error) {
        console.error("Error fetching leaderboard: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [db]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the SMEC Battle Code arena.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16">
              Loading leaderboard...
            </div>
          ) : leaderboardData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Score</TableHead>
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
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.branch} - {user.year}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end font-semibold gap-1">
                            <Award className="h-4 w-4 text-primary" />
                            <span>{user.points.toLocaleString()}</span>
                        </div>
                    </TableCell>
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
