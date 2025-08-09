
'use client'

import { SmecBattleCodeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Award, BarChart, Home, Info, LogOut, Moon, Settings, Sun, User, Trophy, ArrowRight, Menu, Flame } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);
  const [userStats, setUserStats] = useState<{ rank: number; points: number } | null>(null);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Must be in useEffect to access localStorage on client
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
        router.push('/login');
    } else {
        setCurrentUser(user);

        const storedLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
        const sortedUsers = Object.entries(storedLeaderboard)
          .sort(([, a]: any, [, b]: any) => b.points - a.points)
          .map(([email, userData]: [string, any], index) => ({
                email,
                rank: index + 1,
                points: userData.points,
          }));
        
        const currentUserStats = sortedUsers.find(u => u.email === user.email);
        if(currentUserStats) {
            setUserStats({ rank: currentUserStats.rank, points: currentUserStats.points });
        } else {
           setUserStats({ rank: 0, points: 0 });
        }
    }
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
    <div className="flex h-screen w-full overflow-hidden flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-slate-900 text-white flex-col hidden md:flex">
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

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white">
           <h1 className="text-xl font-bold">Welcome 👋</h1>
           <div className="flex items-center gap-4">
              <Sheet>
                 <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Menu className="h-6 w-6" />
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="right" className="bg-slate-900 text-white w-64 p-4">
                    <nav className="flex flex-col gap-4 mt-8">
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
                     <div className="mt-auto flex flex-col gap-4 absolute bottom-4 right-4 left-4">
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
                     </div>
                 </SheetContent>
              </Sheet>
           </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden">
             <ScrollArea className="flex-1">
                <main className="bg-muted/40 p-4 md:p-8">{children}</main>
            </ScrollArea>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden sticky bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-700 flex justify-around p-2">
             {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg px-2 py-1 transition-all w-20',
                    pathname === link.href ? 'text-primary' : 'text-slate-400'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{link.label}</span>
                </Link>
              ))}
        </nav>
    </div>
  );
}
