'use client';

import { useState, useEffect } from 'react';
import { challenges, type Challenge } from '@/lib/data';
import { notFound } from 'next/navigation';
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
import { Terminal, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type TestResult = {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
};

export default function ChallengePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [generatedTests, setGeneratedTests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    results: TestResult[];
    score: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const foundChallenge = challenges.find((c) => c.id === params.id) || null;
    if (foundChallenge) {
      setChallenge(foundChallenge);
      setCode(foundChallenge.solution);
      setLanguage(foundChallenge.language);
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
    return <div>Loading...</div>;
  }

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };
  
  const handleSubmit = async () => {
    if (!challenge) return;
    setIsSubmitting(true);
    setSubmissionResult(null);

    // Simulate running test cases
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would execute the code and get the actual output.
    // For this prototype, we'll just pretend the user provided the correct solution.
    const isCorrectSolution = code.trim() === challenge.solution.trim();

    const results: TestResult[] = challenge.testCases.map(testCase => {
        const passed = isCorrectSolution; // Simplified check
        return {
            input: testCase.input,
            expected: testCase.output,
            actual: passed ? testCase.output : 'Wrong Answer',
            passed: passed,
        };
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = challenge.testCases.length;
    const passRate = totalCount > 0 ? passedCount / totalCount : 0;
    
    const difficultyPoints = { Easy: 10, Medium: 25, Hard: 50 }[challenge.difficulty];
    const score = Math.round(difficultyPoints * passRate);
    
    setSubmissionResult({ results, score });
    setIsSubmitting(false);

    toast({
        title: passRate === 1 ? 'Accepted!' : 'Some tests failed',
        description: `You passed ${passedCount} out of ${totalCount} test cases. You earned ${score} points.`,
        variant: passRate === 1 ? 'default' : 'destructive',
    });
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
    <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <Badge variant="outline" className={
                  challenge.difficulty === 'Easy' ? 'border-green-500 text-green-500' :
                  challenge.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                  'border-red-500 text-red-500'
                }>{challenge.difficulty}</Badge>
            </div>
            <CardDescription>{challenge.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenge.examples.map((example, index) => (
                <div key={index}>
                  <p className="font-semibold">Example {index + 1}:</p>
                  <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm font-mono">
                    <p><strong>Input:</strong> {example.input}</p>
                    <p><strong>Output:</strong> {example.output}</p>
                    {example.explanation && (
                      <p><strong>Explanation:</strong> {example.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {submissionResult ? <SubmissionResultView /> : <GeneratedTestsView />}
        
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Solution</h2>
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
        <CodeEditor value={code} onChange={handleCodeChange} language={language} />
        <Button onClick={handleSubmit} disabled={isSubmitting || !code} className="w-full">
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Submitting...
              </>
            ) : 'Submit Solution'}
        </Button>
        {isSubmitting && <Progress value={undefined} className="w-full h-1 animate-pulse" />}
      </div>
    </div>
  );
}
