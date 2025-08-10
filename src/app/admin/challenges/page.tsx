
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { challenges as initialChallenges, type Challenge } from '@/lib/data';
import { PlusCircle, Trash2, Edit, ArrowDownAZ, ArrowDownUp, ShieldOff, Shield, Code } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch, runTransaction, getDoc, deleteField } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';


type SortType = 'title' | 'difficulty';

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

type FormData = Omit<Challenge, 'id' | 'tags'> & { tags: string };

const defaultFormData: FormData = {
  title: '',
  difficulty: 'Easy',
  language: 'Python',
  points: 10,
  description: '',
  tags: '',
  solution: '',
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', output: '', isHidden: false }],
  isEnabled: true,
};

export default function ManageChallengesPage() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [sortType, setSortType] = useState<SortType>('title');
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isCodeEditorVisible, setIsCodeEditorVisible] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  
  const db = getFirestore(app);

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const challengesCollection = collection(db, 'challenges');
      let challengesSnapshot = await getDocs(challengesCollection);

      if (challengesSnapshot.empty) {
        console.log("No challenges found, seeding initial data...");
        const batch = writeBatch(db);
        initialChallenges.forEach(challengeData => {
            const challengeRef = doc(collection(db, 'challenges')); // Create ref with new ID
            batch.set(challengeRef, { ...challengeData, id: challengeRef.id }); // Store the ID within the doc
        });
        await batch.commit();
        
        challengesSnapshot = await getDocs(challengesCollection); // Re-fetch after seeding
        toast({
          title: 'Challenges Seeded',
          description: 'Initial challenges have been loaded into Firestore.',
        });
      }
      
      const challengesList = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      setChallenges(challengesList);

    } catch (error) {
       console.error("Error loading challenges from Firestore: ", error);
       toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load challenges from Firestore.'
       });
    } finally {
        setIsLoading(false);
    }
  }, [db, toast]);
  
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);
  
  const handleInputChange = useCallback((field: keyof Omit<FormData, 'examples' | 'testCases'>, value: string | number | boolean) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const handleSolutionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, solution: value }));
  }, []);

  const handleArrayChange = useCallback((arrayName: 'examples' | 'testCases', index: number, field: string, value: string | boolean) => {
    setFormData(prev => {
        const newArray = [...prev[arrayName]];
        // @ts-ignore
        newArray[index] = {...newArray[index], [field]: value};
        return {...prev, [arrayName]: newArray};
    });
  }, []);

  const addArrayItem = useCallback((arrayName: 'examples' | 'testCases') => {
    setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], arrayName === 'examples' ? { input: '', output: '', explanation: '' } : { input: '', output: '', isHidden: false }]
    }));
  }, []);

  const removeArrayItem = useCallback((arrayName: 'examples' | 'testCases', index: number) => {
      setFormData(prev => ({
        ...prev,
        // @ts-ignore
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
      }));
  }, []);

  const handleAddNewClick = () => {
    setEditingChallengeId(null);
    setFormData(defaultFormData);
    setIsFormVisible(true);
    setIsCodeEditorVisible(false);
  };
  
  const handleEditClick = (challenge: Challenge) => {
      setEditingChallengeId(challenge.id!);
      setFormData({
        ...defaultFormData, // ensure all fields are present
        ...challenge,
        tags: Array.isArray(challenge.tags) ? challenge.tags.join(', ') : '',
        testCases: challenge.testCases || [{ input: '', output: '', isHidden: false }],
        isEnabled: challenge.isEnabled !== false, // Default to true if undefined
      });
      setIsFormVisible(true);
      setIsCodeEditorVisible(false);
  }

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingChallengeId(null);
    setFormData(defaultFormData);
    setIsCodeEditorVisible(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
        return;
    }
    const challengeDataToSave = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if(editingChallengeId) {
        const challengeRef = doc(db, 'challenges', editingChallengeId);
        await setDoc(challengeRef, { ...challengeDataToSave, id: editingChallengeId }, { merge: true });
      } else {
        const challengesRef = collection(db, 'challenges');
        const newDocRef = doc(challengesRef); // Create ref to get ID first
        await setDoc(newDocRef, { ...challengeDataToSave, id: newDocRef.id }); // Save data with its own ID
      }
      
      toast({
          title: `Challenge ${editingChallengeId ? 'Updated' : 'Added'}!`,
          description: `Successfully saved "${challengeDataToSave.title}".`,
      });
      
      // Refresh local state
      fetchChallenges();

    } catch (error) {
        console.error("Error saving challenge: ", error);
        toast({
          variant: 'destructive',
          title: 'Error Saving Challenge',
          description: 'Could not save the challenge to Firestore.'
        });
    } finally {
      handleCancel();
    }
  };
  
  const handleDelete = async () => {
    if (!challengeToDelete) return;

    // First, get all user documents. This is done outside the transaction.
    const usersSnapshot = await getDocs(collection(db, "users"));

    try {
        await runTransaction(db, async (transaction) => {
            const challengeRef = doc(db, "challenges", challengeToDelete);
            
            // For each user, prepare to delete their challenge-related data.
            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;

                // Path refs
                const solutionRef = doc(db, `users/${userId}/solutions`, challengeToDelete);
                const submissionsPath = `users/${userId}/submissions/${challengeToDelete}/attempts`;
                const inProgressRef = doc(db, `users/${userId}/challengeData/inProgress`);
                const completedRef = doc(db, `users/${userId}/challengeData/completed`);

                // This is a simplified approach. For a large number of users, 
                // you'd want to handle this in a batched server-side process.
                // We read all potentially affected documents for a user.
                const submissionsSnapshot = await getDocs(collection(db, submissionsPath));

                // WRITES: Now perform all writes based on the reads.
                transaction.delete(solutionRef);

                submissionsSnapshot.forEach(submissionDoc => {
                    transaction.delete(submissionDoc.ref);
                });

                // Use field deletion for progress/completion tracking
                transaction.update(inProgressRef, { [challengeToDelete]: deleteField() });
                transaction.update(completedRef, { [challengeToDelete]: deleteField() });
            }

            // Finally, delete the main challenge document.
            transaction.delete(challengeRef);
        });

        toast({
            title: "Challenge Deleted",
            description: "The challenge and all associated user data have been removed.",
        });
        fetchChallenges(); // Refresh the list
    } catch (error) {
        console.error("Error deleting challenge transactionally: ", error);
        toast({
            variant: "destructive",
            title: "Error Deleting Challenge",
            description: "Could not delete the challenge. Please check console for details.",
        });
    } finally {
        setChallengeToDelete(null);
    }
  };

  const sortedAndFilteredChallenges = useMemo(() => {
    return [...challenges]
      .filter(challenge => languageFilter === 'All' || challenge.language === languageFilter)
      .sort((a, b) => {
        if (sortType === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortType === 'difficulty') {
          return (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0);
        }
        return 0;
      });
  }, [challenges, languageFilter, sortType]);
  
  if (isFormVisible) {
     return (
        <Card>
          <CardHeader>
            <CardTitle>{editingChallengeId ? 'Edit Challenge' : 'Create New Challenge'}</CardTitle>
            <CardDescription>
                {editingChallengeId ? 'Modify the details of the existing challenge.' : 'Fill out the form below to add a new challenge.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <Label htmlFor='title'>Title</Label>
                    <Input id='title' placeholder="e.g., Two Sum" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                       <Label>Difficulty</Label>
                       <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                           <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="Easy">Easy</SelectItem>
                             <SelectItem value="Medium">Medium</SelectItem>
                             <SelectItem value="Hard">Hard</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
                   <div className="space-y-2">
                       <Label>Default Language</Label>
                       <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                           <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="C++">C++</SelectItem>
                              <SelectItem value="Java">Java</SelectItem>
                              <SelectItem value="Python">Python</SelectItem>
                              <SelectItem value="JavaScript">JavaScript</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
                   <div className="space-y-2">
                       <Label htmlFor="points">Points</Label>
                       <Input id="points" type="number" placeholder="e.g., 10" value={formData.points} onChange={e => handleInputChange('points', parseInt(e.target.value, 10) || 0)} required />
                   </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Detailed problem description..." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required rows={5} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" placeholder="e.g., Array, Hash Table, Two Pointers" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} required/>
                </div>

                <div className="space-y-4">
                  <Label>Examples</Label>
                  {formData.examples.map((_, index) => (
                    <Card key={index} className="p-4 relative bg-muted/50">
                       <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <Label>Input</Label>
                               <Textarea value={formData.examples[index].input} onChange={(e) => handleArrayChange('examples', index, 'input', e.target.value)} required />
                           </div>
                           <div className="space-y-2">
                               <Label>Output</Label>
                               <Textarea value={formData.examples[index].output} onChange={(e) => handleArrayChange('examples', index, 'output', e.target.value)} required />
                           </div>
                       </div>
                       <div className="mt-4 space-y-2">
                           <Label>Explanation (Optional)</Label>
                           <Textarea value={formData.examples[index].explanation || ''} onChange={(e) => handleArrayChange('examples', index, 'explanation', e.target.value)} />
                       </div>
                       <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeArrayItem('examples', index)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => addArrayItem('examples')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Example
                  </Button>
                </div>
                
                <div className="space-y-4">
                   <Label>Test Cases</Label>
                   {formData.testCases.map((testCase, index) => (
                     <Card key={index} className="p-4 relative bg-muted/50">
                        <div className="flex items-center justify-end gap-2 absolute top-2 right-2">
                             <div className="flex items-center gap-2 text-sm">
                                <Switch
                                  id={`isHidden-${index}`}
                                  checked={testCase.isHidden}
                                  onCheckedChange={(checked) => handleArrayChange('testCases', index, 'isHidden', checked)}
                                />
                                <Label htmlFor={`isHidden-${index}`} className="flex items-center gap-1">
                                  {testCase.isHidden ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                                  Hidden
                                </Label>
                             </div>
                             <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeArrayItem('testCases', index)}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-8">
                            <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea value={formData.testCases[index].input} onChange={(e) => handleArrayChange('testCases', index, 'input', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Output</Label>
                                <Textarea value={formData.testCases[index].output} onChange={(e) => handleArrayChange('testCases', index, 'output', e.target.value)} required />
                            </div>
                        </div>
                     </Card>
                   ))}
                   <Button type="button" variant="outline" onClick={() => addArrayItem('testCases')}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Test Case
                   </Button>
                </div>

                <div className="space-y-2">
                    <Label>Solution Code</Label>
                    {isCodeEditorVisible ? (
                        <div className="h-64 rounded-md border">
                            <CodeEditor
                                value={formData.solution}
                                onChange={handleSolutionChange}
                                language={formData.language.toLowerCase()}
                            />
                        </div>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => setIsCodeEditorVisible(true)}>
                            <Code className="mr-2 h-4 w-4" />
                            View/Edit Solution
                        </Button>
                    )}
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                    <Switch id="isEnabled" checked={formData.isEnabled} onCheckedChange={(checked) => handleInputChange('isEnabled', checked)} />
                    <Label htmlFor="isEnabled">Enable this challenge</Label>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit">{editingChallengeId ? 'Update Challenge' : 'Create Challenge'}</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </form>
          </CardContent>
        </Card>
     );
  }

  return (
    <>
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Challenges</h1>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Challenge
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Challenges</CardTitle>
           {isLoading ? (
              <CardDescription>Loading challenges...</CardDescription>
           ) : (
              <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Filter by language" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="All">All Languages</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                      </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                      <Button variant={sortType === 'title' ? 'secondary' : 'ghost'} onClick={() => setSortType('title')}>
                          <ArrowDownAZ className="mr-2 h-4 w-4" />
                          Sort by Title
                      </Button>
                      <Button variant={sortType === 'difficulty' ? 'secondary' : 'ghost'} onClick={() => setSortType('difficulty')}>
                          <ArrowDownUp className="mr-2 h-4 w-4" />
                          Sort by Difficulty
                      </Button>
                  </div>
              </div>
           )}
        </CardHeader>
        <CardContent>
           {isLoading ? (
              <div className="text-center py-16">Loading challenges...</div>
           ) : (
              <div className="space-y-4">
                {sortedAndFilteredChallenges.length > 0 ? sortedAndFilteredChallenges.map(challenge => (
                  <div key={challenge.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg gap-4">
                    <div>
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.difficulty} - {challenge.points} Points - {challenge.language}</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Badge variant={challenge.isEnabled !== false ? 'default' : 'secondary'}>
                            {challenge.isEnabled !== false ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(challenge)}>
                             <Edit className="mr-2 h-4 w-4" />
                             Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setChallengeToDelete(challenge.id!)}>
                             <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                        </Button>
                     </div>
                  </div>
                )) : (
                  <div className="text-center py-16 text-muted-foreground">
                    No challenges found.
                  </div>
                )}
              </div>
          )}
        </CardContent>
      </Card>
    </div>
     <AlertDialog open={!!challengeToDelete} onOpenChange={(open) => !open && setChallengeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the challenge and all associated user data (solutions, progress, submissions, etc.) from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChallengeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
