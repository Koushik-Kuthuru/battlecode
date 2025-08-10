
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { LogOut, Moon, Sun, User, Home, Code, Bug } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

type CurrentUser = {
  uid: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { setTheme, theme } = useTheme();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

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
    const fetchChallenge = async () => {
      const docRef = doc(db, "challenges", challengeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChallenge({ id: docSnap.id, ...docSnap.data() } as Challenge);
      }
    };
    fetchChallenge();
  }, [challengeId]);

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

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
       <header className="flex-shrink-0 flex items-center justify-between p-2 bg-slate-900 text-white border-b border-slate-700">
           <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold px-2">
                    <SmecBattleCodeLogo className="h-8 w-8" />
                    <span className="text-xl hidden sm:inline">SMEC Battle Code</span>
                </Link>
                <Button variant="ghost" asChild>
                    <Link href="/dashboard"><Home className="mr-2 h-4 w-4"/> Dashboard</Link>
                </Button>
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

        <main className="flex-1 flex flex-col overflow-hidden bg-muted/40">
           <ResizablePanelGroup direction="vertical">
               <ResizablePanel defaultSize={65} minSize={50}>
                 <div className="h-full w-full flex">
                    {children}
                 </div>
               </ResizablePanel>
               <ResizableHandle withHandle />
               <ResizablePanel defaultSize={35} minSize={20}>
                  <Tabs defaultValue="description" className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex items-center justify-between p-2 border-b">
                        <TabsList>
                          <TabsTrigger value="description">Description</TabsTrigger>
                          <TabsTrigger value="result">Result</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                           <Button><Code className="mr-2"/> Run Code</Button>
                           <Button variant="outline"><Bug className="mr-2"/> Submit</Button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-auto">
                        <TabsContent value="description" className="mt-0 h-full">
                           <ScrollArea className="h-full p-6">
                            {challenge ? (
                                <>
                                  <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
                                  <div className="flex items-center gap-4 mb-4">
                                      <Badge variant={challenge.difficulty === 'Easy' ? 'secondary' : challenge.difficulty === 'Medium' ? 'outline' : 'destructive'}>{challenge.difficulty}</Badge>
                                      <p className="text-sm text-muted-foreground">Language: {challenge.language}</p>
                                      <p className="text-sm font-bold text-primary">{challenge.points} Points</p>
                                  </div>
                                  <p className="text-base mb-6 whitespace-pre-wrap">{challenge.description}</p>
                                  
                                  {challenge?.examples.map((example, index) => (
                                    <div key={index} className="bg-background p-3 rounded-md mb-3">
                                      <p className="font-semibold text-sm mb-1">Example {index + 1}</p>
                                      <p className="font-mono text-xs"><strong>Input:</strong> {example.input}</p>
                                      <p className="font-mono text-xs"><strong>Output:</strong> {example.output}</p>
                                      {example.explanation && <p className="text-xs mt-1 text-muted-foreground"><strong>Explanation:</strong> {example.explanation}</p>}
                                    </div>
                                  ))}

                                  <div className="flex flex-wrap gap-2 mt-6">
                                      {Array.isArray(challenge.tags) && challenge.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                  </div>
                                </>
                            ) : (
                                <div>Loading description...</div>
                            )}
                           </ScrollArea>
                        </TabsContent>
                        <TabsContent value="result" className="mt-0 h-full">
                          <div className="p-4 text-sm text-muted-foreground">
                            Run your code to see test case results here.
                          </div>
                        </TabsContent>
                    </div>
                  </Tabs>
               </ResizablePanel>
           </ResizablePanelGroup>
        </main>
    </div>
  );
}
