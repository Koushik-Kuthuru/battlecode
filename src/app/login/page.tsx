
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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleLogin = async () => {
    setIsLoading(true);
    // Handle admin login
    if (studentId.toLowerCase() === 'admin0822' && password === 'admin0822') {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'admin@smec.ac.in', name: 'Admin', isAdmin: true }));
      router.push('/admin/dashboard');
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome back, Admin!',
      });
      setIsLoading(false);
      return;
    }

    if (!studentId || !password) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please fill in all fields.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Find user by student ID in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("studentId", "==", studentId.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid Student ID or password.',
        });
        setIsLoading(false);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userEmail = userData.email;

      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, userEmail, password);

      router.push('/dashboard');
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.name}!`,
      });

    } catch (error) {
      console.error("Login Error: ", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid Student ID or password.',
      });
    } finally {
        setIsLoading(false);
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
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
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
