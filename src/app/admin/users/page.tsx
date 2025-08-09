
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type UserData = {
    email: string;
    name: string;
    studentId: string;
    points: number;
    branch: string;
    year: string;
    password?: string;
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
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

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
                password: userData.password,
                points: leaderboardEntry.points,
                branch: profile.branch ? BRANCH_MAP[profile.branch] || profile.branch : 'N/A',
                year: profile.year ? `${profile.year} Year` : 'N/A',
                imageUrl: profile.imageUrl,
            };
        });
        
        combinedData.sort((a, b) => b.points - a.points);
        
        setUsers(combinedData);
    }, []);

    const togglePasswordVisibility = (email: string) => {
        setVisiblePasswords(prev => ({ ...prev, [email]: !prev[email] }));
    }

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
                                    <TableHead>Password</TableHead>
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
                                            <div className="flex items-center gap-2">
                                                <span>{visiblePasswords[user.email] ? user.password : '••••••••'}</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePasswordVisibility(user.email)}>
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                            </div>
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
