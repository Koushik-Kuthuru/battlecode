'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth-layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = () => {
    // Basic validation
    if (fullName && email && password && studentId && studentId.length === 10) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[email]) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'An account with this email already exists.',
        });
        return;
      }
       if (Object.values(users).some((user: any) => user.studentId === studentId)) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'An account with this Student ID already exists.',
        });
        return;
      }
      
      // Store user data
      users[email] = { name: fullName, studentId, password };
      localStorage.setItem('users', JSON.stringify(users));

      // Also create a scorecard for the user
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
      leaderboard[email] = { name: fullName, points: 0 };
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

      // "Log in" the new user
      localStorage.setItem('currentUser', JSON.stringify({ email, name: fullName }));
      
      router.push('/dashboard');
      toast({
        title: 'Registration Successful!',
        description: `Welcome to SMECBATTLECODE, ${fullName}!`,
      });
    } else if (studentId.length !== 10) {
        toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'Student ID must be exactly 10 characters.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'Please fill in all fields.',
        });
    }
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value.toUpperCase().slice(0, 10));
  };


  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join SMECBATTLECODE and start your coding journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input id="student-id" placeholder="Your_Student_ID" required value={studentId} onChange={handleStudentIdChange} maxLength={10} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" onClick={handleRegister}>
              Create account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
