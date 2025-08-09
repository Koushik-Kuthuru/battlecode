
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { type Challenge, challenges as initialChallenges } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';


type CurrentUser = {
  uid: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});
  const [inProgressChallenges, setInProgressChallenges] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUser({
            uid: user.uid,
            name: userData.name,
            email: user.email!,
          });

          // Fetch user-specific challenge data (completed, in-progress)
          const completedChallengesSnap = await getDoc(doc(db, `users/${user.uid}/challengeData/completed`));
          setCompletedChallenges(completedChallengesSnap.exists() ? completedChallengesSnap.data() : {});
          
          const inProgressChallengesSnap = await getDoc(doc(db, `users/${user.uid}/challengeData/inProgress`));
          setInProgressChallenges(inProgressChallengesSnap.exists() ? inProgressChallengesSnap.data() : {});

        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, router]);
  
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const challengesCollection = collection(db, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollection);

        if (challengesSnapshot.empty) {
            // Seed initial challenges if collection is empty
            await Promise.all(initialChallenges.map(challenge => {
                const challengeRef = doc(db, 'challenges', challenge.id);
                return setDoc(challengeRef, challenge);
            }));
             setChallenges(initialChallenges);
        } else {
            const challengesList = challengesSnapshot.docs.map(doc => doc.data() as Challenge);
            setChallenges(challengesList);
        }

      } catch (error) {
        console.error("Error fetching challenges: ", error);
        toast({
          variant: 'destructive',
          title: 'Error fetching challenges',
          description: 'Could not load challenges. Please try again later.'
        });
        setChallenges(initialChallenges); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
        fetchChallenges();
    }
  }, [currentUser, db, toast]);

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
    if (challenges.length > 0) {
        const initialLoad = challenges.slice(0, ITEMS_PER_PAGE);
        setDisplayedChallenges(initialLoad);
        setPage(1);
        setHasMore(initialLoad.length < challenges.length);
    }
  }, [challenges]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [hasMore, page, displayedChallenges, isLoading]);

  if (isLoading || !currentUser) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div>Loading...</div>
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2 md:hidden">
            {/* This space is intentionally left blank for the mobile view header */}
        </div>
        <div className="hidden md:flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome {currentUser.name} 👋</h2>
        </div>
        
        <Card className="bg-slate-900 text-white border-0">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 w-full">
                <div className="w-24 h-24 md:w-48 md:h-32 bg-gray-700 rounded-md flex-shrink-0">
                    <img src="https://placehold.co/192x128" alt="Podcast" className="w-full h-full object-cover rounded-md" data-ai-hint="podcast cover" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold leading-tight">WHAT GOOGLE LOOKS FOR IN FUTURE ENGINEERS</h3>
                    <p className="text-muted-foreground text-white/80 text-sm md:text-base">Podcast with Leader Building Teams at Google</p>
                </div>
            </div>
             <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto mt-4 md:mt-0">Register Now</Button>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold tracking-tight">Your Challenges</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedChallenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              isCompleted={!!completedChallenges[challenge.id]}
              isInProgress={!!inProgressChallenges[challenge.id]} 
            />
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

        {!isLoading && !hasMore && challenges.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold tracking-tight">No Challenges Found</h3>
              <p className="text-muted-foreground">It seems there are no challenges available right now.</p>
          </div>
        )}
    </div>
  );
}
