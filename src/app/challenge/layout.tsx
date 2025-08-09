
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { LogOut, Moon, Sun, User, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const { setTheme, theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!user) {
          router.push('/login');
      } else {
          setCurrentUser(user);
          const userProfile = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
          setProfileImageUrl(userProfile.imageUrl || '');
      }
    }
  }, [router, isClient]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/login');
  }
  
  if (!isClient || !currentUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            Loading...
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col">
       <header className="flex-shrink-0 flex items-center justify-between p-2 bg-slate-900 text-white border-b">
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

                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                    <LogOut className="h-5 w-5" />
                </Button>

                <Link href="/profile">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={profileImageUrl} alt={currentUser.name} />
                        <AvatarFallback>
                          <User />
                        </AvatarFallback>
                      </Avatar>
                </Link>
           </div>
       </header>

        <main className="flex-1 flex flex-col overflow-hidden bg-muted/40">
            {children}
        </main>
    </div>
  );
}
