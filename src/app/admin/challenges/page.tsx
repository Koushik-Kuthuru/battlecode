
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { type Challenge } from '@/lib/data';
import { PlusCircle, Trash2, Edit, ArrowDownAZ, ArrowDownUp } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const exampleSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  output: z.string().min(1, 'Output is required'),
  explanation: z.string().optional(),
});

const testCaseSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  output: z.string().min(1, 'Output is required'),
});

const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  language: z.enum(['C', 'C++', 'Java', 'Python', 'JavaScript']),
  points: z.coerce.number().min(1, 'Points must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  tags: z.string().min(1, 'Tags are required'),
  solution: z.string().min(1, 'Solution code is required'),
  examples: z.array(exampleSchema).min(1, 'At least one example is required'),
  testCases: z.array(testCaseSchema).min(1, 'At least one test case is required'),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;
type SortType = 'title' | 'difficulty';

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };


export default function ManageChallengesPage() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [sortType, setSortType] = useState<SortType>('title');


  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const challengesCollection = collection(db, 'challenges');
        const challengeSnapshot = await getDocs(challengesCollection);
        const challengesList = challengeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
        setChallenges(challengesList);
      } catch (error) {
        console.error("Error fetching challenges: ", error);
        toast({
          variant: 'destructive',
          title: 'Error fetching challenges',
          description: 'Could not load challenges from the database.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenges();
  }, [toast]);

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: '',
      difficulty: 'Easy',
      language: 'Python',
      points: 10,
      description: '',
      tags: '',
      solution: '',
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', output: '' }],
    },
  });

  const { fields: exampleFields, append: appendExample, remove: removeExample } = useFieldArray({
    control: form.control,
    name: 'examples',
  });

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase } = useFieldArray({
    control: form.control,
    name: 'testCases',
  });

  const handleAddNewClick = () => {
    setEditingChallenge(null);
    form.reset({
        title: '',
        difficulty: 'Easy',
        language: 'Python',
        points: 10,
        description: '',
        tags: '',
        solution: '',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', output: '' }],
    });
    setIsFormVisible(true);
  };
  
  const handleEditClick = (challenge: Challenge) => {
      setEditingChallenge(challenge);
      form.reset({
        ...challenge,
        tags: challenge.tags.join(', '),
      });
      setIsFormVisible(true);
  }

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingChallenge(null);
    form.reset();
  }

  const onSubmit = async (values: ChallengeFormValues) => {
    const challengeData: Omit<Challenge, 'id'> & { id?: string } = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()),
    };

    try {
      if (editingChallenge) {
          const challengeRef = doc(db, 'challenges', editingChallenge.id);
          await setDoc(challengeRef, challengeData, { merge: true });
          setChallenges(challenges.map(c => c.id === editingChallenge.id ? { ...challengeData, id: editingChallenge.id } : c));
          toast({
              title: 'Challenge Updated!',
              description: `Successfully updated "${challengeData.title}".`,
          });
      } else {
          const docRef = await addDoc(collection(db, 'challenges'), {
            ...challengeData,
            createdAt: serverTimestamp()
          });
          setChallenges([...challenges, { ...challengeData, id: docRef.id }]);
          toast({
              title: 'Challenge Added!',
              description: `Successfully added "${challengeData.title}".`,
          });
      }
    } catch (error) {
        console.error("Error saving challenge: ", error);
        toast({
          variant: 'destructive',
          title: 'Error Saving Challenge',
          description: 'Could not save the challenge to the database.'
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
          return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        }
        return 0;
      });
  }, [challenges, languageFilter, sortType]);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Challenges</h1>
        {!isFormVisible && (
          <Button onClick={handleAddNewClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Challenge
          </Button>
        )}
      </div>

      {isFormVisible ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</CardTitle>
            <CardDescription>
                {editingChallenge ? 'Modify the details of the existing challenge.' : 'Fill out the form below to add a new challenge.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Two Sum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-6">
                   <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               <SelectItem value="C">C</SelectItem>
                               <SelectItem value="C++">C++</SelectItem>
                               <SelectItem value="Java">Java</SelectItem>
                               <SelectItem value="Python">Python</SelectItem>
                               <SelectItem value="JavaScript">JavaScript</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed problem description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                       <FormControl>
                         <Input placeholder="e.g., Array, Hash Table, Two Pointers" {...field} />
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>Examples</Label>
                  {exampleFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                       <div className="grid md:grid-cols-2 gap-4">
                           <FormField
                              control={form.control}
                              name={`examples.${index}.input`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Input</FormLabel>
                                  <FormControl><Textarea {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`examples.${index}.output`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Output</FormLabel>
                                  <FormControl><Textarea {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                       </div>
                       <FormField
                          control={form.control}
                          name={`examples.${index}.explanation`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Explanation (Optional)</FormLabel>
                              <FormControl><Textarea {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeExample(index)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendExample({ input: '', output: '', explanation: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Example
                  </Button>
                </div>
                
                <div className="space-y-4">
                   <Label>Test Cases</Label>
                   {testCaseFields.map((field, index) => (
                     <Card key={field.id} className="p-4 relative">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`testCases.${index}.input`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Input</FormLabel>
                                  <FormControl><Textarea {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`testCases.${index}.output`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Output</FormLabel>
                                  <FormControl><Textarea {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeTestCase(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </Card>
                   ))}
                   <Button type="button" variant="outline" onClick={() => appendTestCase({ input: '', output: '' })}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Test Case
                   </Button>
                </div>

                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Code</FormLabel>
                      <FormControl>
                         <div className="h-64 rounded-md border">
                           <CodeEditor
                             value={field.value}
                             onChange={field.onChange}
                             language={form.watch('language')}
                           />
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                    <Button type="submit">{editingChallenge ? 'Update Challenge' : 'Create Challenge'}</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Existing Challenges</CardTitle>
             {isLoading ? (
                <CardDescription>Loading challenges...</CardDescription>
             ) : (
                <div className="mt-4 flex items-center gap-4">
                    <Select value={languageFilter} onValueChange={setLanguageFilter}>
                        <SelectTrigger className="w-[180px]">
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
                <div className="text-center">Loading...</div>
             ) : (
                <div className="space-y-4">
                  {sortedAndFilteredChallenges.map(challenge => (
                    <div key={challenge.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.difficulty} - {challenge.points} points - {challenge.language}</p>
                      </div>
                       <Button variant="outline" size="sm" onClick={() => handleEditClick(challenge)}>
                           <Edit className="mr-2 h-4 w-4" />
                           Edit
                       </Button>
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
