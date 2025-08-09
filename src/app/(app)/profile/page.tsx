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

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [profile, setProfile] = useState({
    branch: '',
    year: '',
    section: '',
    imageUrl: '',
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
      const savedProfile = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
      setProfile({
        branch: savedProfile.branch || '',
        year: savedProfile.year || '',
        section: savedProfile.section || '',
        imageUrl: savedProfile.imageUrl || '',
      });
    }
  }, [router]);
  
  const handleInputChange = (field: keyof typeof profile, value: string) => {
      setProfile(prev => ({...prev, [field]: value}));
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            handleInputChange('imageUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!currentUser) return;
    localStorage.setItem(`userProfile_${currentUser.email}`, JSON.stringify(profile));
    toast({
      title: 'Profile Saved',
      description: 'Your profile information has been updated.',
    });
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

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
          
          <Button onClick={handleSave} className="w-full md:w-auto">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
