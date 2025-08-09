
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Award, BarChart, Home, Info, LogOut, Moon, Settings, Sun, User, Trophy, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Must be in useEffect to access localStorage on client
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
        router.push('/login');
    }
    setCurrentUser(user);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/login');
  }

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart },
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/about', label: 'About', icon: Info },
    { href: '/points', label: 'Points System', icon: Award },
  ];
  
  if (!currentUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            Loading...
        </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-slate-900 text-white flex flex-col">
           <div className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold px-2 mb-8">
                <SmecBattleCodeLogo className="h-8 w-8" />
                <span className="text-xl">SMEC Battle Code</span>
              </Link>
           </div>
            <ScrollArea className="flex-1 px-4">
                <nav className="flex flex-col gap-2">
                     {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-slate-800',
                            pathname === link.href ? 'bg-slate-700' : 'text-slate-300'
                          )}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      ))}
                </nav>
            </ScrollArea>
            
            <div className="mt-auto flex flex-col gap-4 p-4">
                 <div className="flex items-center justify-between">
                     <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                        <LogOut className="h-5 w-5" />
                     </Button>
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
                 </div>
                 <div className="border-t border-slate-700 pt-4">
                     <Link href="/profile" className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={JSON.parse(localStorage.getItem(`userProfile_${currentUser.email}`) || '{}').imageUrl} alt={currentUser.name} />
                            <AvatarFallback>
                              <User />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{currentUser.name}</p>
                            <p className="text-xs text-slate-400">{currentUser.email}</p>
                          </div>
                     </Link>
                 </div>
            </div>
        </aside>
        <div className="flex flex-1 overflow-hidden">
            <ScrollArea className="flex-1">
                <main className="bg-muted/40 p-8">{children}</main>
            </ScrollArea>
            <aside className="w-80 flex-shrink-0 border-l hidden lg:block">
              <ScrollArea className="h-full p-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Leaderboard
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <p className="text-xs text-muted-foreground mb-4">
                        Top performers this week.
                      </p>
                      <Link href="/leaderboard">
                        <Button className="w-full">
                          View Leaderboard <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                      </Link>
                  </CardContent>
                </Card>
              </ScrollArea>
            </aside>
        </div>
    </div>
  );
}

    
