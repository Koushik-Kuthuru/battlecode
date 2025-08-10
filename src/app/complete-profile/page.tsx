
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Upload, Loader2, AlertCircle } from 'lucide-react';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { AuthLayout } from '@/components/auth-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyUserImage } from '@/ai/flows/verify-user-image';

type ProfileData = {
  branch: string;
  year: string;
  section: string;
  imageUrl: string;
  imageFile: File | null;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    branch: '',
    year: '',
    section: '',
    imageUrl: '',
    imageFile: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().profileComplete) {
          router.push('/dashboard');
        } else {
          setUser(currentUser);
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  const handleInputChange = (field: keyof Omit<ProfileData, 'imageUrl' | 'imageFile'>, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile((prev) => ({
            ...prev,
            imageUrl: event.target.result as string,
            imageFile: file,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profile.branch || !profile.year || !profile.section || !profile.imageFile || !profile.imageUrl) {
        toast({ variant: 'destructive', title: 'Error', description: 'All fields are required, including a profile picture.' });
        return;
    }
    
    setIsSaving(true);

    try {
      // 1. Verify image using Genkit flow
      toast({ title: 'Verifying Image...', description: 'Please wait while our AI analyzes your profile picture.' });
      const { hasFace, reasoning } = await verifyUserImage({ photoDataUri: profile.imageUrl });

      if (!hasFace) {
        toast({ variant: 'destructive', title: 'Invalid Profile Picture', description: reasoning });
        setIsSaving(false);
        return;
      }
      
      toast({ title: 'Image Verified!', description: 'Now saving your profile...' });

      // 2. Upload image to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      const uploadResult = await uploadString(storageRef, profile.imageUrl, 'data_url');
      const finalImageUrl = await getDownloadURL(uploadResult.ref);

      // 3. Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        branch: profile.branch,
        year: profile.year,
        section: profile.section,
        imageUrl: finalImageUrl,
        profileComplete: true,
      });

      toast({
        title: 'Profile Complete!',
        description: 'Your profile has been saved. Redirecting you to the dashboard...',
      });
      
      router.push('/dashboard');

    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your profile. Please try again.',
      });
       setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide a few more details to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                   All fields, including a clear profile picture of yourself, are mandatory to proceed.
                </AlertDescription>
            </Alert>
        
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28">
              <AvatarImage src={profile.imageUrl} alt="User Profile" />
              <AvatarFallback>
                <UserIcon className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Picture
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select value={profile.branch} onValueChange={(value) => handleInputChange('branch', value)}>
              <SelectTrigger id="branch">
                <SelectValue placeholder="Select your branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cse">Computer Science Engineering</SelectItem>
                <SelectItem value="ece">Electronics & Communication</SelectItem>
                <SelectItem value="eee">Electrical & Electronics</SelectItem>
                <SelectItem value="mech">Mechanical Engineering</SelectItem>
                <SelectItem value="civil">Civil Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={profile.year} onValueChange={(value) => handleInputChange('year', value)}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={profile.section} onValueChange={(value) => handleInputChange('section', value)}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </Trigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying & Saving...</> : 'Save and Continue'}
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
