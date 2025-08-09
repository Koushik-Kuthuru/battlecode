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

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    // In a real app, you'd have proper validation and a backend call.
    if (studentId && password) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      const userEmail = Object.keys(users).find(email => users[email].studentId === studentId.toUpperCase());
      const user = userEmail ? users[userEmail] : null;

      if(user && user.password === password) {
        localStorage.setItem('currentUser', JSON.stringify({ email: userEmail, name: user.name }));
        router.push('/dashboard');
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid Student ID or password.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input id="student-id" type="text" placeholder="YOUR_ID" required value={studentId} onChange={handleStudentIdChange} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
