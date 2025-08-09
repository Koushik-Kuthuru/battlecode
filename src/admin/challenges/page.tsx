
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
import { PlusCircle, Trash2, Edit, ArrowDownAZ, ArrowDownUp } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

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
  testCases: [{ input: '', output: '' }],
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
  
  const db = getFirestore(app);

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const challengesCollection = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesCollection);

      if (challengesSnapshot.empty) {
        // Seed initial challenges if the collection is empty
        await Promise.all(initialChallenges.map(challenge => {
            const challengeRef = doc(db, 'challenges', challenge.id);
            return setDoc(challengeRef, challenge);
        }));
        setChallenges(initialChallenges);
        toast({
          title: 'Challenges Seeded',
          description: 'Initial challenges have been loaded into Firestore.',
        });
      } else {
        const challengesList = challengesSnapshot.docs.map(doc => doc.data() as Challenge);
        setChallenges(challengesList);
      }
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
  
  const handleInputChange = useCallback((field: keyof Omit<FormData, 'examples' | 'testCases'>, value: string | number) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const handleSolutionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, solution: value }));
  }, []);

  const handleArrayChange = useCallback((arrayName: 'examples' | 'testCases', index: number, field: string, value: string) => {
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
        [arrayName]: [...prev[arrayName], arrayName === 'examples' ? { input: '', output: '', explanation: '' } : { input: '', output: '' }]
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
  };
  
  const handleEditClick = (challenge: Challenge) => {
      setEditingChallengeId(challenge.id);
      setFormData({
        ...challenge,
        tags: Array.isArray(challenge.tags) ? challenge.tags.join(', ') : '',
      });
      setIsFormVisible(true);
  }

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingChallengeId(null);
    setFormData(defaultFormData);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
        return;
    }
    const challengeDataToSave: Challenge = {
        id: editingChallengeId || new Date().toISOString(), // Use existing ID or create new
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      const challengeRef = doc(db, 'challenges', challengeDataToSave.id);
      await setDoc(challengeRef, challengeDataToSave, { merge: true });
      
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
                   {formData.testCases.map((_, index) => (
                     <Card key={index} className="p-4 relative bg-muted/50">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea value={formData.testCases[index].input} onChange={(e) => handleArrayChange('testCases', index, 'input', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Output</Label>
                                <Textarea value={formData.testCases[index].output} onChange={(e) => handleArrayChange('testCases', index, 'output', e.target.value)} required />
                            </div>
                        </div>
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeArrayItem('testCases', index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </Card>
                   ))}
                   <Button type="button" variant="outline" onClick={() => addArrayItem('testCases')}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Test Case
                   </Button>
                </div>

                <div className="space-y-2">
                   <Label>Solution Code</Label>
                   <div className="h-64 rounded-md border">
                     <CodeEditor
                       value={formData.solution}
                       onChange={handleSolutionChange}
                       language={formData.language.toLowerCase()}
                     />
                   </div>
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
                      <p className="text-sm text-muted-foreground">{challenge.difficulty} - {challenge.points} - {challenge.language}</p>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => handleEditClick(challenge)}>
                         <Edit className="mr-2 h-4 w-4" />
                         Edit
                     </Button>
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
  );
}
