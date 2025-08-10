
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { LogOut, Moon, Sun, User, Home, Code, Bug } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

type CurrentUser = {
  uid: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

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
          // This case might occur if auth user exists but firestore doc doesn't.
          // For now, we'll treat them as logged out for this layout.
          setCurrentUser(null);
        }
      } else {
        // Allow non-logged in users to view challenges
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db]);

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
           
           <div className="flex items-center gap-4">
              <Button><Code className="mr-2"/> Run Code</Button>
              <Button variant="outline"><Bug className="mr-2"/> Submit</Button>
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
               <ResizablePanel defaultSize={75} minSize={50}>
                 <div className="h-full w-full flex">
                    {children}
                 </div>
               </ResizablePanel>
               <ResizableHandle withHandle />
               <ResizablePanel defaultSize={25} minSize={15}>
                   <div className="h-full p-4 flex flex-col">
                     <h2 className="text-lg font-semibold mb-2">Test Results</h2>
                     <div className="flex-grow mt-2 bg-background rounded-md p-4 text-sm text-muted-foreground overflow-auto">
                       Run your code to see test case results here.
                     </div>
                   </div>
               </ResizablePanel>
           </ResizablePanelGroup>
        </main>
    </div>
  );
}
