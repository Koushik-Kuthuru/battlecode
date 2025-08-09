
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type UserData = {
    email: string;
    name: string;
    studentId: string;
    points: number;
    branch: string;
    year: string;
    imageUrl?: string;
};

const BRANCH_MAP: Record<string, string> = {
    cse: 'CSE',
    ece: 'ECE',
    eee: 'EEE',
    mech: 'Mechanical',
    civil: 'Civil',
};

export default function ManageUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);

    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');

        const combinedData: UserData[] = Object.entries(storedUsers).map(([email, userData]: [string, any]) => {
            const profile = JSON.parse(localStorage.getItem(`userProfile_${email}`) || '{}');
            const leaderboardEntry = leaderboard[email] || { points: 0 };
            
            return {
                email,
                name: userData.name,
                studentId: userData.studentId,
                points: leaderboardEntry.points,
                branch: profile.branch ? BRANCH_MAP[profile.branch] || profile.branch : 'N/A',
                year: profile.year ? `${profile.year} Year` : 'N/A',
                imageUrl: profile.imageUrl,
            };
        });
        
        // Sort users by points in descending order
        combinedData.sort((a, b) => b.points - a.points);
        
        setUsers(combinedData);
    }, []);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Branch & Year</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.email}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={user.imageUrl} alt={user.name} />
                                                    <AvatarFallback><User /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.studentId}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p>{user.branch}</p>
                                            <p className="text-sm text-muted-foreground">{user.year}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{user.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No users have registered yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
