
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Loader2, PlusCircle, Trash2, Edit, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

type Advertisement = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonLink: string;
  buttonText: string;
  isEnabled: boolean;
  createdAt: any;
};

type FormData = Omit<Advertisement, 'id' | 'createdAt'>;

const defaultFormData: FormData = {
  title: '',
  description: '',
  imageUrl: '',
  buttonLink: '#',
  buttonText: 'Learn More',
  isEnabled: true,
};

export default function ManageAdvertisementPage() {
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  
  const db = getFirestore(app);
  const adsCollectionRef = collection(db, 'advertisements');

  useEffect(() => {
    const q = query(adsCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement));
      setAdvertisements(adsList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching advertisements:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load advertisements from Firestore.'
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, toast]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewClick = () => {
    setEditingAdId(null);
    setFormData(defaultFormData);
    setIsFormVisible(true);
  };

  const handleEditClick = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      buttonLink: ad.buttonLink,
      buttonText: ad.buttonText,
      isEnabled: ad.isEnabled,
    });
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingAdId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingAdId) {
        const adDocRef = doc(db, 'advertisements', editingAdId);
        await setDoc(adDocRef, formData, { merge: true });
        toast({
          title: 'Advertisement Updated!',
          description: 'The ad has been successfully updated.',
        });
      } else {
        const dataToSave = { ...formData, createdAt: serverTimestamp() };
        await addDoc(adsCollectionRef, dataToSave);
        toast({
          title: 'Advertisement Added!',
          description: 'The new ad has been created.',
        });
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving advertisement:", error);
      toast({
        variant: 'destructive',
        title: 'Error Saving',
        description: 'Could not save the advertisement to Firestore.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      await deleteDoc(doc(db, "advertisements", adId));
      toast({
        title: "Advertisement Deleted",
        description: "The advertisement has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting advertisement: ", error);
      toast({
        variant: "destructive",
        title: "Error Deleting",
        description: "Could not delete the advertisement.",
      });
    }
  };
  
  if (isFormVisible) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
              <CardTitle>{editingAdId ? 'Edit Advertisement' : 'Create New Advertisement'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription>
              {editingAdId ? 'Update the details for this advertisement.' : 'Fill out the form to create a new ad for the carousel.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor='title'>Title</Label>
                <Input id='title' placeholder="Ad Title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="A short, catchy description." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" placeholder="https://example.com/image.png" value={formData.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input id="buttonText" placeholder="e.g., Register Now" value={formData.buttonText} onChange={(e) => handleInputChange('buttonText', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input id="buttonLink" placeholder="https://example.com/register" value={formData.buttonLink} onChange={(e) => handleInputChange('buttonLink', e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isEnabled" checked={formData.isEnabled} onCheckedChange={(checked) => handleInputChange('isEnabled', checked)} />
                <Label htmlFor="isEnabled">Enable this advertisement</Label>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {isSaving ? 'Saving...' : (editingAdId ? 'Save Changes' : 'Create Ad')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Advertisements</h1>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Ad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Advertisements</CardTitle>
          <CardDescription>
            Manage the ads that appear in the dashboard carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-16">
               <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : advertisements.length > 0 ? (
            <div className="space-y-4">
              {advertisements.map(ad => (
                <div key={ad.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg gap-4">
                  <div className="flex items-center gap-4">
                      <img src={ad.imageUrl || 'https://placehold.co/64'} alt={ad.title} className="w-16 h-16 object-cover rounded-md bg-muted" />
                      <div>
                        <h3 className="font-semibold">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={ad.isEnabled ? 'default' : 'secondary'}>{ad.isEnabled ? 'Enabled' : 'Disabled'}</Badge>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(ad)}>
                             <Edit className="mr-2 h-4 w-4" />
                             Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}>
                             <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                        </Button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                No advertisements found. Click "Add New Ad" to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    