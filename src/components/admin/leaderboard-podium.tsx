
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Crown, Medal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function LeaderboardPodium({ users, isLoading }: { users: UserData[], isLoading: boolean }) {
    if (isLoading) {
        return <div>Loading leaderboard...</div>;
    }

    const topUsers = users.slice(0, 10);
    const top3 = topUsers.slice(0, 3);
    const others = topUsers.slice(3);

    const podiumOrder = [
        top3.find(u => u.points === top3[1]?.points ? false : true && top3[0]?.points > top3[1]?.points), // 2nd
        top3.find(u => u.points), // 1st
        top3[2] // 3rd
    ];
    
    // A simple reorder to match the visual podium: 2nd, 1st, 3rd
    const podiumDisplayUsers = [
        top3.length > 1 ? top3[1] : undefined, // 2nd place
        top3.length > 0 ? top3[0] : undefined, // 1st place
        top3.length > 2 ? top3[2] : undefined, // 3rd place
    ];


    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top 10 performing users.</CardDescription>
            </CardHeader>
            <CardContent>
                {topUsers.length < 3 ? (
                    <div className="text-center text-muted-foreground py-8">
                        Not enough users to display a podium yet.
                    </div>
                ) : (
                    <div className="flex justify-center items-end gap-4 md:gap-8 mb-8">
                        {/* 2nd Place */}
                        <div className="text-center flex flex-col items-center w-1/4">
                            <Avatar className="w-20 h-20 border-4 border-slate-400">
                                <AvatarImage src={podiumDisplayUsers[0]?.imageUrl} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <h4 className="font-bold mt-2 truncate">{podiumDisplayUsers[0]?.name}</h4>
                            <p className="text-sm text-muted-foreground">{podiumDisplayUsers[0]?.points.toLocaleString()} pts</p>
                            <div className="bg-slate-300 dark:bg-slate-600 h-20 w-full rounded-t-md mt-2 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-300">2</div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center flex flex-col items-center w-1/3">
                            <div className="relative">
                               <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-400" />
                                <Avatar className="w-28 h-28 border-4 border-yellow-400">
                                    <AvatarImage src={podiumDisplayUsers[1]?.imageUrl} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                            </div>
                            <h4 className="font-bold mt-2 truncate">{podiumDisplayUsers[1]?.name}</h4>
                            <p className="text-sm text-muted-foreground">{podiumDisplayUsers[1]?.points.toLocaleString()} pts</p>
                            <div className="bg-yellow-300 dark:bg-yellow-600 h-32 w-full rounded-t-md mt-2 flex items-center justify-center text-3xl font-bold text-yellow-700 dark:text-yellow-200">1</div>
                        </div>
                        
                        {/* 3rd Place */}
                        <div className="text-center flex flex-col items-center w-1/4">
                             <Avatar className="w-20 h-20 border-4 border-amber-600">
                                <AvatarImage src={podiumDisplayUsers[2]?.imageUrl} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <h4 className="font-bold mt-2 truncate">{podiumDisplayUsers[2]?.name}</h4>
                            <p className="text-sm text-muted-foreground">{podiumDisplayUsers[2]?.points.toLocaleString()} pts</p>
                            <div className="bg-amber-400 dark:bg-amber-800 h-16 w-full rounded-t-md mt-2 flex items-center justify-center text-xl font-bold text-amber-800 dark:text-amber-300">3</div>
                        </div>

                    </div>
                )}
                
                {others.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {others.map((user, index) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-bold text-center">{index + 4}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.imageUrl} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{user.points.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

            </CardContent>
        </Card>
    )
}
