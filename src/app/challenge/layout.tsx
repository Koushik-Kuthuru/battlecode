
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { LogOut, Moon, Sun, User, Home, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Challenge } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { type EvaluateCodeOutput } from '@/ai/flows/evaluate-code';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

type CurrentUser = {
  uid: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export type Submission = {
  id: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Failed';
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
};

type ChallengeContextType = {
  challenge: Challenge | null;
  runResult: EvaluateCodeOutput | null;
  setRunResult: React.Dispatch<React.SetStateAction<EvaluateCodeOutput | null>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
};

const ChallengeContext = createContext<ChallengeContextType | null>(null);

export const useChallenge = () => {
    const context = useContext(ChallengeContext);
    if (!context) {
        throw new Error('useChallenge must be used within a ChallengeLayout');
    }
    return context;
}


export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { setTheme, theme } = useTheme();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(true);
  const [runResult, setRunResult] = useState<EvaluateCodeOutput | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeResultTab, setActiveResultTab] = useState('0');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const auth = getAuth(app);
  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            uid: user.uid,
            name: userData.name,
            email: userData.email,
            imageUrl: userData.imageUrl,
          });
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!challengeId) return;
    setIsChallengeLoading(true);
    const fetchChallenge = async () => {
      try {
        const docRef = doc(db, "challenges", challengeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setChallenge({ id: docSnap.id, ...docSnap.data() } as Challenge);
        } else {
          console.error("No such challenge found in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setIsChallengeLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (!currentUser || !challengeId) return;

    const submissionsRef = collection(db, `users/${currentUser.uid}/submissions/${challengeId}/attempts`);
    const q = query(submissionsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userSubmissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(userSubmissions);
    });

    return () => unsubscribe();
  }, [currentUser, challengeId]);


  useEffect(() => {
    if(runResult) {
        setActiveResultTab('0');
    }
  }, [runResult]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            Loading...
        </div>
    )
  }

  const contextValue = {
      challenge,
      runResult,
      setRunResult,
      activeTab,
      setActiveTab,
  };

  return (
    <ChallengeContext.Provider value={contextValue}>
        <div className="flex h-screen w-full flex-col overflow-hidden">
           <header className="flex-shrink-0 flex items-center justify-between p-2 bg-slate-900 text-white border-b border-slate-700">
               <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold px-2">
                        <Home className="h-6 w-6" />
                        <span className="text-xl hidden sm:inline">{isChallengeLoading ? "Loading..." : challenge?.title}</span>
                    </Link>
               </div>
               
               <div className="flex items-center gap-2">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                         className="text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    
                    {currentUser ? (
                        <>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                <LogOut className="h-5 w-5" />
                            </Button>

                            <Link href="/profile">
                                 <Avatar className="h-9 w-9">
                                    <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
                                    <AvatarFallback>
                                      <User />
                                    </AvatarFallback>
                                  </Avatar>
                            </Link>
                        </>
                    ) : (
                        <Button asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
               </div>
           </header>

            <main className="flex-1 flex flex-row overflow-hidden bg-muted/40">
               <ResizablePanelGroup direction="horizontal">
                   <ResizablePanel defaultSize={50} minSize={30}>
                     <div className="h-full flex flex-col bg-background">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                           <div className="flex-shrink-0 p-2 border-b border-r">
                               <TabsList>
                                 <TabsTrigger value="description">Description</TabsTrigger>
                                 <TabsTrigger value="submissions">Submissions</TabsTrigger>
                                 <TabsTrigger value="result">Result</TabsTrigger>
                               </TabsList>
                           </div>
                           <div className="flex-grow overflow-auto border-r">
                               <TabsContent value="description" className="mt-0 h-full">
                                  <ScrollArea className="h-full p-6">
                                   {isChallengeLoading ? (
                                       <div className="space-y-4">
                                         <Skeleton className="h-8 w-3/4" />
                                         <Skeleton className="h-4 w-1/2" />
                                         <Skeleton className="h-20 w-full" />
                                         <Skeleton className="h-12 w-full" />
                                         <Skeleton className="h-12 w-full" />
                                       </div>
                                   ) : challenge ? (
                                       <>
                                         <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
                                         <div className="flex items-center gap-4 mb-4">
                                             <Badge variant={challenge.difficulty === 'Easy' ? 'secondary' : challenge.difficulty === 'Medium' ? 'outline' : 'destructive'}>{challenge.difficulty}</Badge>
                                             <p className="text-sm text-muted-foreground">Language: {challenge.language}</p>
                                             <p className="text-sm font-bold text-primary">{challenge.points} Points</p>
                                         </div>
                                         <p className="text-base mb-6 whitespace-pre-wrap">{challenge.description}</p>
                                         
                                         {challenge.examples.map((example, index) => (
                                           <div key={index} className="bg-muted p-3 rounded-md mb-3 border">
                                             <p className="font-semibold text-sm mb-1">Example {index + 1}</p>
                                             <pre className="font-mono text-xs bg-slate-900 text-white p-2 rounded-md"><strong>Input:</strong> {example.input}{'\n'}<strong>Output:</strong> {example.output}</pre>
                                             {example.explanation && <p className="text-xs mt-1 text-muted-foreground"><strong>Explanation:</strong> {example.explanation}</p>}
                                           </div>
                                         ))}

                                         <div className="flex flex-wrap gap-2 mt-6">
                                             {Array.isArray(challenge.tags) && challenge.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                         </div>
                                       </>
                                   ) : (
                                       <div>Challenge details not found.</div>
                                   )}
                                  </ScrollArea>
                               </TabsContent>
                               <TabsContent value="submissions" className="mt-0 h-full">
                                  <ScrollArea className="h-full">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Language</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {submissions.map((submission) => (
                                          <TableRow key={submission.id}>
                                            <TableCell>
                                              {formatDistanceToNow(new Date(submission.timestamp.seconds * 1000), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant={submission.status === 'Accepted' ? 'default' : 'destructive'}>
                                                {submission.status}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>{submission.language}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    {submissions.length === 0 && (
                                       <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                          <AlertCircle className="h-10 w-10 mb-4" />
                                          <p className="font-semibold">No Submissions Yet</p>
                                          <p>Your submission history for this challenge will appear here.</p>
                                        </div>
                                    )}
                                  </ScrollArea>
                                </TabsContent>
                               <TabsContent value="result" className="mt-0 h-full">
                                 <ScrollArea className="h-full">
                                    {runResult ? (
                                        <div className="p-4 space-y-4">
                                            <h2 className={cn("text-xl font-bold flex items-center gap-2", runResult.allPassed ? 'text-green-600' : 'text-red-600')}>
                                                {runResult.allPassed ? <CheckCircle /> : <XCircle />}
                                                {runResult.allPassed ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}
                                            </h2>
                                            <p className="text-muted-foreground">{runResult.feedback}</p>
                                            <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
                                                <TabsList>
                                                    {runResult.results.map((res, i) => (
                                                        <TabsTrigger key={i} value={String(i)} className="flex items-center gap-2">
                                                            Test Case {i + 1}
                                                            {res.passed ? <CheckCircle className="text-green-500 h-4 w-4" /> : <XCircle className="text-red-500 h-4 w-4" />}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                                {runResult.results.map((res, i) => (
                                                    <TabsContent key={i} value={String(i)} className="mt-4 space-y-4">
                                                        <div>
                                                            <h3 className="font-semibold mb-2">Input</h3>
                                                            <Textarea readOnly value={res.testCaseInput} className="font-mono text-sm" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Your Output</h3>
                                                                <Textarea readOnly value={res.actualOutput} className="font-mono text-sm" />
                                                            </div>
                                                             <div>
                                                                <h3 className="font-semibold mb-2">Expected Output</h3>
                                                                <Textarea readOnly value={res.expectedOutput} className="font-mono text-sm" />
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                ))}
                                            </Tabs>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                          <AlertCircle className="h-10 w-10 mb-4" />
                                          <p>Run your code to see the results here.</p>
                                        </div>
                                    )}
                                 </ScrollArea>
                               </TabsContent>
                           </div>
                         </Tabs>
                     </div>
                   </ResizablePanel>
                   <ResizableHandle withHandle />
                   <ResizablePanel defaultSize={50} minSize={30}>
                     <div className="h-full w-full flex">
                        {children}
                     </div>
                   </ResizablePanel>
               </ResizablePanelGroup>
            </main>
        </div>
    </ChallengeContext.Provider>
  );
}

