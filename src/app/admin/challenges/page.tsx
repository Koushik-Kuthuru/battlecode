
'use client';

import { useState, useEffect } from 'react';
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
import { challenges as existingChallenges, type Challenge } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

export default function ManageChallengesPage() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch this from a database.
    // For now, we'll use the local data and store updates in localStorage.
    const storedChallenges = JSON.parse(localStorage.getItem('challenges') || 'null');
    setChallenges(storedChallenges || existingChallenges);
  }, []);

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

  const handleAddChallenge = (values: ChallengeFormValues) => {
    const newChallenge: Challenge = {
      ...values,
      id: (challenges.length + 1).toString(),
      tags: values.tags.split(',').map(tag => tag.trim()),
    };

    const updatedChallenges = [...challenges, newChallenge];
    setChallenges(updatedChallenges);
    localStorage.setItem('challenges', JSON.stringify(updatedChallenges)); // Persist for demo
    
    toast({
      title: 'Challenge Added!',
      description: `Successfully added "${newChallenge.title}".`,
    });
    
    form.reset();
    setIsAdding(false);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Challenges</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isAdding ? 'Cancel' : 'Add New Challenge'}
        </Button>
      </div>

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Challenge</CardTitle>
            <CardDescription>Fill out the form below to add a new challenge.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleAddChallenge)} className="space-y-8">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Input type="number" placeholder="e.g., 10" {...field} />
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

                {/* Dynamic Examples */}
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
                
                {/* Dynamic Test Cases */}
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

                <Button type="submit">Create Challenge</Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Existing Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.difficulty} - {challenge.points} points</p>
                  </div>
                   <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
