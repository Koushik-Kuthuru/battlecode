
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
import { User, Upload, Mail, KeyRound, LogOut } from 'lucide-react';
import { getAuth, onAuthStateChanged, updateEmail, EmailAuthProvider, reauthenticateWithCredential, type User as FirebaseUser, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

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
  const [newEmail, setNewEmail] = useState('');
  const [passwordForEmail, setPasswordForEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
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
                const userEmail = user.email || userData.email;
                setCurrentUser({
                    uid: user.uid,
                    name: userData.name,
                    email: userEmail,
                });
                setNewEmail(userEmail);
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

  const handleChangeEmail = async () => {
      if(!currentUser || !newEmail || !passwordForEmail) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
          return;
      }
      setIsChangingEmail(true);

      try {
          const user = auth.currentUser;
          if(!user) throw new Error("User not found");

          const credential = EmailAuthProvider.credential(user.email!, passwordForEmail);
          await reauthenticateWithCredential(user, credential);
          
          await updateEmail(user, newEmail);
          
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, { email: newEmail });

          setCurrentUser(prev => prev ? {...prev, email: newEmail} : null);
          setPasswordForEmail('');

          toast({
              title: 'Email Changed',
              description: `Your email has been updated. A verification link was sent to ${newEmail}.`,
          });
      } catch (error: any) {
          console.error("Error changing email: ", error);
          let description = 'Could not change your email.';
          if (error.code === 'auth/wrong-password') {
            description = 'Incorrect password. Please try again.';
          } else if (error.code === 'auth/email-already-in-use') {
            description = 'This email address is already in use by another account.';
          }
          toast({ variant: 'destructive', title: 'Error', description });
      } finally {
          setIsChangingEmail(false);
      }
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!currentUser) return null;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Profile</CardTitle>
          <CardDescription>Manage your personal and account information.</CardDescription>
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
                    <SelectItem value="csd">CSE (Data Science)</SelectItem>
                    <SelectItem value="cse_aiml">CSE (AI & ML)</SelectItem>
                    <SelectItem value="aiml">AI & Machine Learning</SelectItem>
                    <SelectItem value="aids">AI & Data Science</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
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
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </Button>

          <Separator />
          
           <div>
              <h3 className="text-lg font-medium mb-4">Account Settings</h3>
               <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">
                        <Mail className="inline-block mr-2 h-4 w-4" />
                        Change Email Address
                    </Label>
                    <Input id="new-email" type="email" placeholder="new.email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="password-for-email">
                        <KeyRound className="inline-block mr-2 h-4 w-4" />
                        Enter Current Password to Confirm
                    </Label>
                    <Input id="password-for-email" type="password" value={passwordForEmail} onChange={(e) => setPasswordForEmail(e.target.value)} />
                  </div>
                  <Button onClick={handleChangeEmail} disabled={isChangingEmail || newEmail === currentUser.email}>
                    {isChangingEmail ? 'Updating Email...' : 'Update Email'}
                  </Button>
              </div>
           </div>

           <Separator />
            <div className="pt-2">
                <Button variant="destructive-outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
