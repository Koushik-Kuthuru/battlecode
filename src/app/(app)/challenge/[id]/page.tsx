'use client';

import { useState, useEffect } from 'react';
import { challenges, type Challenge } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateTestCases } from '@/ai/flows/generate-test-cases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle2, XCircle, Award, ArrowRight, PanelLeftOpen, PanelLeftClose, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type TestResult = {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
};

type RunType = 'run' | 'submit';

export default function ChallengePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [generatedTests, setGeneratedTests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    results: TestResult[];
    score: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const currentChallengeIndex = challenges.findIndex((c) => c.id === params.id);
  const nextChallengeId = currentChallengeIndex !== -1 && currentChallengeIndex < challenges.length - 1 
    ? challenges[currentChallengeIndex + 1].id 
    : null;

  useEffect(() => {
    const foundChallenge = challenges.find((c) => c.id === params.id) || null;
    if (foundChallenge) {
      setChallenge(foundChallenge);
      
      const savedCode = localStorage.getItem(`code_${params.id}`);
      setCode(savedCode || foundChallenge.solution);
      
      const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
      setIsCompleted(completedChallenges[params.id] || false);

      setLanguage(foundChallenge.language);
      setSubmissionResult(null); // Reset results when challenge changes
      setActiveTab('description'); // Reset tab to description
    } else {
      notFound();
    }
  }, [params.id]);

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => e.preventDefault();
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        toast({
          variant: 'destructive',
          title: 'Action Prohibited',
          description: 'Developer tools are disabled during assessments.',
        });
      }
    };

    document.addEventListener('contextmenu', handleContextmenu);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [toast]);
  
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && challenge && code && !submissionResult) {
        toast({
          title: 'Tab switch detected!',
          description: 'Generating test cases based on your current code.',
        });
        setIsGenerating(true);
        try {
          const result = await generateTestCases({
            code,
            programmingLanguage: language,
            problemDescription: challenge.description,
          });
          setGeneratedTests(result.testCases);
          setActiveTab('results');
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not generate test cases.',
          });
        } finally {
          setIsGenerating(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [code, language, challenge, toast, submissionResult]);

  if (!challenge) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleSaveCode = () => {
    localStorage.setItem(`code_${params.id}`, code);
    toast({
        title: 'Code Saved!',
        description: 'Your progress has been saved locally.',
    });
  }
  
  const handleCodeExecution = async (runType: RunType) => {
    if (!challenge) return;
    
    if (runType === 'submit') {
      handleSaveCode();
    }

    if (runType === 'run') setIsRunning(true);
    if (runType === 'submit') setIsSubmitting(true);
    
    setSubmissionResult(null);

    // Simulate running test cases
    await new Promise(resolve => setTimeout(resolve, 1500));

    const testCasesToUse = runType === 'run' ? challenge.examples.map(ex => ({input: ex.input, output: ex.output})) : challenge.testCases;
    
    const isCorrectSolution = code.trim() === challenge.solution.trim();

    const results: TestResult[] = testCasesToUse.map(testCase => {
        const passed = isCorrectSolution;
        return {
            input: testCase.input,
            expected: testCase.output,
            actual: passed ? testCase.output : 'Wrong Answer',
            passed: passed,
        };
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = testCasesToUse.length;
    const passRate = totalCount > 0 ? passedCount / totalCount : 0;
    
    const score = Math.round(challenge.points * passRate);
    
    setSubmissionResult({ results, score });
    setActiveTab('results');
    
    if (runType === 'run') setIsRunning(false);
    if (runType === 'submit') {
      setIsSubmitting(false);

      if (passRate === 1) {
          setIsCompleted(true);
          const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
          completedChallenges[params.id] = true;
          localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
      }

      toast({
          title: passRate === 1 ? 'Accepted!' : 'Some tests failed on submission',
          description: `You passed ${passedCount} out of ${totalCount} test cases. You earned ${score} points.`,
          variant: passRate === 1 ? 'default' : 'destructive',
      });
    }
  };

  const SubmissionResultView = () => {
    if(!submissionResult) return null;

    const passedCount = submissionResult.results.filter(r => r.passed).length;
    const totalCount = submissionResult.results.length;
    const allPassed = passedCount === totalCount;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {allPassed ? (
                        <CheckCircle2 className="h-7 w-7 text-green-500"/>
                    ) : (
                        <XCircle className="h-7 w-7 text-red-500"/>
                    )}
                    <span>{allPassed ? 'Accepted' : 'Wrong Answer'}</span>
                </CardTitle>
                <CardDescription>
                    {`You passed ${passedCount} of ${totalCount} test cases.`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                    <Award className="h-8 w-8 text-primary"/>
                    <div>
                        <p className="font-bold text-lg">{submissionResult.score} Points Awarded</p>
                        <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                    </div>
                </div>
                <Tabs defaultValue="case-0">
                    <TabsList>
                        {submissionResult.results.map((_, index) => (
                            <TabsTrigger key={index} value={`case-${index}`}>Case {index + 1}</TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollArea className="h-48 mt-2">
                    {submissionResult.results.map((result, index) => (
                        <TabsContent key={index} value={`case-${index}`}>
                           <div className="space-y-2 font-mono text-sm">
                                <div>
                                    <p className="font-semibold">Input:</p>
                                    <pre className="mt-1 rounded-md bg-slate-950 p-2 text-slate-50">{result.input}</pre>
                                </div>
                                <div>
                                    <p className="font-semibold">Expected Output:</p>
                                    <pre className="mt-1 rounded-md bg-slate-950 p-2 text-slate-50">{result.expected}</pre>
                                </div>
                                <div>
                                    <p className="font-semibold">Your Output:</p>
                                     <pre className={`mt-1 rounded-md p-2 ${result.passed ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'}`}>{result.actual}</pre>
                                </div>
                           </div>
                        </TabsContent>
                    ))}
                    </ScrollArea>
                </Tabs>
            </CardContent>
        </Card>
    )
  }

  const GeneratedTestsView = () => {
    if (isGenerating || generatedTests.length > 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Generated Test Cases</CardTitle>
                    <CardDescription>
                        {isGenerating ? "AI is generating test cases based on your code..." : "Test cases generated from your code after tab switch."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isGenerating ? (
                        <div className="flex items-center gap-2">
                           <Terminal className="h-4 w-4 animate-spin"/> 
                           <p>Generating...</p>
                        </div>
                    ) : (
                        <Alert>
                          <Terminal className="h-4 w-4" />
                          <AlertTitle>Heads up!</AlertTitle>
                          <AlertDescription>
                            <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
                                {generatedTests.join('\n\n')}
                            </pre>
                          </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        )
    }
    return null;
  }
  
  return (
    <div className="flex h-screen flex-col">
      <div className={`flex flex-1 grid ${isSidebarCollapsed ? 'grid-cols-[auto,1fr]' : 'grid-cols-[minmax(300px,1fr),2fr]'} overflow-hidden transition-all duration-300`}>
        {/* Left Panel */}
        <div className={`relative flex flex-col h-full bg-card border-r transition-all duration-300 ${isSidebarCollapsed ? "w-0 p-0 overflow-hidden" : "w-full p-6"}`}>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{challenge.title}</h1>
                <Badge variant="outline" className={
                  challenge.difficulty === 'Easy' ? 'border-green-500 text-green-500' :
                  challenge.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                  'border-red-500 text-red-500'
                }>{challenge.difficulty}</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                  {challenge.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>

              <Separator className="my-6" />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="results" disabled={!submissionResult && generatedTests.length === 0}>Results</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description">
                     <article className="prose prose-sm dark:prose-invert max-w-none">
                          <p>{challenge.description}</p>
                          
                          {challenge.examples.map((example, index) => (
                              <div key={index} className="mt-4">
                                  <p className="font-semibold">Example {index + 1}:</p>
                                  <div className="mt-2 rounded-md bg-muted/50 p-3 font-mono text-sm">
                                      <p><strong>Input:</strong> {example.input}</p>
                                      <p><strong>Output:</strong> {example.output}</p>
                                      {example.explanation && <p className="mt-2"><strong>Explanation:</strong> {example.explanation}</p>}
                                  </div>
                              </div>
                          ))}
                     </article>
                  </TabsContent>
                  <TabsContent value="results">
                      {submissionResult ? <SubmissionResultView /> : <GeneratedTestsView />}
                  </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="flex flex-col h-full overflow-hidden">
             <div className="p-4 flex justify-between items-center border-b">
                  <Button 
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                  >
                      {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                      <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                   <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="C++">C++</SelectItem>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="flex-1 relative">
                  <CodeEditor value={code} onChange={handleCodeChange} language={language} />
              </div>
              <div className="p-4 bg-background border-t flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleSaveCode} disabled={!code}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    {nextChallengeId && isCompleted && (
                      <Button variant="outline" onClick={() => router.push(`/challenge/${nextChallengeId}`)}>
                          Next Challenge <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {(isRunning || isSubmitting) && <Progress value={undefined} className="w-32 h-1 animate-pulse" />}
                    <Button variant="outline" onClick={() => handleCodeExecution('run')} disabled={isRunning || isSubmitting || !code}>
                        {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                    <Button onClick={() => handleCodeExecution('submit')} disabled={isRunning || isSubmitting || !code}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
              </div>
        </div>
      </div>
    </div>
  );
}
