'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
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
import { Terminal } from 'lucide-react';

export default function ChallengePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [generatedTests, setGeneratedTests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const foundChallenge = challenges.find((c) => c.id === params.id) || null;
    if (foundChallenge) {
      setChallenge(foundChallenge);
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
      if (document.hidden && challenge && code) {
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
  }, [code, language, challenge, toast]);


  if (!challenge) {
    return <div>Loading...</div>;
  }

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  return (
    <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            <CardDescription>{challenge.description}</CardDescription>
          </CardHeader>
        </Card>
        {(isGenerating || generatedTests.length > 0) && (
            <Card>
                <CardHeader>
                    <CardTitle>Generated Test Cases</CardTitle>
                    <CardDescription>
                        {isGenerating ? "AI is generating test cases based on your code..." : "Test cases generated from your code after tab switch."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isGenerating ? (
                        <div className="space-y-2">
                           <p>Loading...</p>
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
        )}
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
        <Button className="w-full">Submit Solution</Button>
      </div>
    </div>
  );
}
