
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { challenges, type Challenge } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 6;

export default function DashboardPage() {
  const router = useRouter();
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<{email: string, name: string} | null>(null);

  useEffect(() => {
    // We need to ensure localStorage is accessed only on the client side.
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
      const savedCompletions = JSON.parse(localStorage.getItem(`completedChallenges_${user.email}`) || '{}');
      setCompletedChallenges(savedCompletions);
    }
  }, [router]);
  
  const loadMoreChallenges = () => {
    const nextPage = page + 1;
    const newChallenges = challenges.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedChallenges(newChallenges);
    setPage(nextPage);
    if(newChallenges.length >= challenges.length) {
      setHasMore(false);
    }
  }

  useEffect(() => {
    const initialChallenges = challenges.slice(0, ITEMS_PER_PAGE);
    setDisplayedChallenges(initialChallenges);
    setPage(1);
    setHasMore(initialChallenges.length < challenges.length);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreChallenges();
        }
      },
      { rootMargin: '200px' }
    );
    
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, page]);

  if (!currentUser) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div>Loading...</div>
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-8 p-8">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome {currentUser.name} 👋</h2>
        </div>
        
        <Card className="bg-slate-900 text-white border-0">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-48 h-32 bg-gray-700 rounded-md flex-shrink-0">
                    <img src="https://placehold.co/192x128" alt="Podcast" className="w-full h-full object-cover rounded-md" data-ai-hint="podcast cover" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">WHAT GOOGLE LOOKS FOR IN FUTURE ENGINEERS</h3>
                    <p className="text-muted-foreground text-white/80">Podcast with Leader Building Teams at Google</p>
                </div>
            </div>
             <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Register Now</Button>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold tracking-tight">Your Challenges</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} isCompleted={!!completedChallenges[challenge.id]} />
          ))}
        </div>
        
        {hasMore && (
          <div ref={loaderRef} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasMore && displayedChallenges.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold tracking-tight">No Challenges Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
    </div>
  );
}

    