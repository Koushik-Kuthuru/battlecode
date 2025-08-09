
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
import { User, Upload } from 'lucide-react';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';

type CurrentUser = {
  uid: string;
  name: string;
  email: string;
}

type ProfileData = {
    branch: string;
    year: string;
    section: string;
    imageUrl: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    branch: '',
    year: '',
    section: '',
    imageUrl: '',
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setCurrentUser({
                    uid: user.uid,
                    name: userData.name,
                    email: userData.email,
                });
                setProfile({
                    branch: userData.branch || '',
                    year: userData.year || '',
                    section: userData.section || '',
                    imageUrl: userData.imageUrl || '',
                });
            } else {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, router]);
  
  const handleInputChange = (field: keyof Omit<ProfileData, 'imageUrl'>, value: string) => {
      setProfile(prev => ({...prev, [field]: value}));
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            setProfile(prev => ({...prev, imageUrl: event.target.result as string}));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);

    try {
        let finalImageUrl = profile.imageUrl;

        if (newImage && profile.imageUrl.startsWith('data:')) {
            const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
            const uploadResult = await uploadString(storageRef, profile.imageUrl, 'data_url');
            finalImageUrl = await getDownloadURL(uploadResult.ref);
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            branch: profile.branch,
            year: profile.year,
            section: profile.section,
            imageUrl: finalImageUrl,
        });

        // Update local state to reflect saved image URL
        setProfile(prev => ({...prev, imageUrl: finalImageUrl}));
        
        toast({
            title: 'Profile Saved',
            description: 'Your profile information has been updated.',
        });
    } catch (error) {
        console.error("Error saving profile: ", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your profile.',
         });
    } finally {
        setIsSaving(false);
        setNewImage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!currentUser) return null; // Should be redirected by useEffect

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.imageUrl} alt={currentUser.name} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Change Picture
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label>Name</Label>
                <Input value={currentUser.name} disabled />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input value={currentUser.email} disabled />
            </div>
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
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                        <SelectItem value="D">Section D</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>
          
          <Button onClick={handleSave} className="w-full md:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
