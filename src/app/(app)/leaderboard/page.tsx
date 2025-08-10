
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Trophy, User } from 'lucide-react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  uid: string;
  name: string;
  points: number;
  email: string;
  imageUrl?: string;
  branch?: string;
  year?: string;
};

const getFormattedBranchAndYear = (user: LeaderboardEntry) => {
    const branch = user.branch ? BRANCH_MAP[user.branch] || user.branch : null;
    const year = user.year ? `${user.year} Year` : null;
    if (!branch && !year) return 'SMEC';
    if (!year) return branch;
    if (!branch) return year;
    return `${branch} - ${year}`;
}

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
            uid: doc.id,
            name: data.name,
            points: data.points || 0,
            email: data.email,
            imageUrl: data.imageUrl,
            branch: data.branch,
            year: data.year,
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

  const top3 = leaderboardData.slice(0, 3);
  const podiumUsers = [
      top3.find(u => u.rank === 2),
      top3.find(u => u.rank === 1),
      top3.find(u => u.rank === 3)
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the SMEC Battle Code arena.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-end gap-2 md:gap-4 mb-8 min-h-[260px]">
                <Skeleton className="h-48 w-1/4 rounded-t-lg" />
                <Skeleton className="h-64 w-1/3 rounded-t-lg" />
                <Skeleton className="h-40 w-1/4 rounded-t-lg" />
             </div>
          ) : leaderboardData.length > 0 ? (
            <div className="mb-8">
              <div className="relative flex justify-center items-end gap-2 md:gap-4 min-h-[260px]">
                {/* Podium Backgrounds */}
                <div className="absolute bottom-0 h-36 w-full bg-gradient-to-t from-primary/20 to-transparent" />
                
                {/* 2nd Place */}
                {podiumUsers[0] && (
                  <div className="relative text-center flex flex-col items-center w-1/4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <Trophy className="h-10 w-10 text-slate-400 mb-2" />
                    <Avatar className="w-20 h-20 border-4 border-slate-400">
                        <AvatarImage src={podiumUsers[0].imageUrl} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold mt-2 truncate w-full">{podiumUsers[0].name}</h4>
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{podiumUsers[0].points.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 h-24 w-full rounded-t-lg mt-2 flex items-center justify-center text-3xl font-bold text-slate-500 dark:text-slate-300">2</div>
                  </div>
                )}
                
                {/* 1st Place */}
                {podiumUsers[1] && (
                    <div className="relative text-center flex flex-col items-center w-1/3 z-10 animate-fade-in-up">
                      <Trophy className="h-12 w-12 text-yellow-400 mb-2" />
                       <Avatar className="w-28 h-28 border-4 border-yellow-400">
                          <AvatarImage src={podiumUsers[1].imageUrl} />
                          <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <h4 className="font-bold mt-2 truncate w-full">{podiumUsers[1].name}</h4>
                       <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                          <Award className="h-4 w-4 text-primary" />
                          <span>{podiumUsers[1].points.toLocaleString()}</span>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-800/40 h-32 w-full rounded-t-lg mt-2 flex items-center justify-center text-4xl font-bold text-yellow-600 dark:text-yellow-200">1</div>
                  </div>
                )}

                {/* 3rd Place */}
                {podiumUsers[2] && (
                  <div className="relative text-center flex flex-col items-center w-1/4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <Trophy className="h-8 w-8 text-amber-600 mb-2" />
                    <Avatar className="w-16 h-16 border-4 border-amber-600">
                      <AvatarImage src={podiumUsers[2].imageUrl} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold mt-2 truncate w-full">{podiumUsers[2].name}</h4>
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{podiumUsers[2].points.toLocaleString()}</span>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/50 h-20 w-full rounded-t-lg mt-2 flex items-center justify-center text-2xl font-bold text-amber-800 dark:text-amber-300">3</div>
                  </div>
                )}
              </div>
            </div>
          ) : null }

          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : leaderboardData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((user: LeaderboardEntry) => (
                  <TableRow key={user.rank} className="font-medium">
                    <TableCell className="text-center font-bold text-lg">{user.rank}</TableCell>
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
                            <p className="text-sm text-muted-foreground">{getFormattedBranchAndYear(user)}</p>
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
