
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { type Challenge, challenges as initialChallenges } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, addDoc, writeBatch, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

type CurrentUser = {
  uid: string;
  name: string;
  email: string;
}

type Advertisement = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonLink: string;
  buttonText: string;
  isEnabled: boolean;
}

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

export default function MissionsPage() {
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
  const [isChallengesLoading, setIsChallengesLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('All');
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const ITEMS_PER_PAGE = 6;
   const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          if (!userData.profileComplete) {
              router.push('/complete-profile');
              return;
          }

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
  
  // Real-time listener for advertisements
  useEffect(() => {
    const adsCollectionRef = collection(db, 'advertisements');
    const q = query(adsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Advertisement))
        .filter(ad => ad.isEnabled);
      setAdvertisements(adsList);
    });
    return () => unsubscribe();
  }, [db]);


  const fetchChallenges = useCallback(async () => {
    setIsChallengesLoading(true);
    try {
      const challengesCollection = collection(db, 'challenges');
      let challengesSnapshot = await getDocs(challengesCollection);

      if (challengesSnapshot.empty) {
          console.log("No challenges found, seeding initial data...");
          const batch = writeBatch(db);
          initialChallenges.forEach(challengeData => {
              const challengeRef = doc(collection(db, 'challenges'));
              batch.set(challengeRef, { ...challengeData, id: challengeRef.id });
          });
          await batch.commit();
          
          challengesSnapshot = await getDocs(challengesCollection); // Re-fetch after seeding
          toast({
            title: 'Welcome!',
            description: 'Initial challenges have been loaded for you.'
          });
      }
      
      const challengesList = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
      setChallenges(challengesList);

    } catch (error) {
      console.error("Error fetching challenges: ", error);
      toast({
        variant: 'destructive',
        title: 'Error fetching challenges',
        description: 'Could not load challenges. Please try again later.'
      });
      // Fallback to static data on error
      const challengesWithIds = initialChallenges.map((c, i) => ({...c, id: `fallback-${i}`}));
      setChallenges(challengesWithIds); 
    } finally {
      setIsChallengesLoading(false);
    }
  }, [db, toast]);

  useEffect(() => {
    if (currentUser) {
        fetchChallenges();
    }
  }, [currentUser, fetchChallenges]);

  const filteredChallenges = challenges.filter(challenge => 
    difficultyFilter === 'All' || challenge.difficulty === difficultyFilter
  );

  const loadMoreChallenges = useCallback(() => {
    const nextPage = page + 1;
    const newChallenges = filteredChallenges.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedChallenges(newChallenges);
    setPage(nextPage);
    if(newChallenges.length >= filteredChallenges.length) {
      setHasMore(false);
    }
  }, [page, filteredChallenges]);

  useEffect(() => {
    if (challenges.length > 0) {
        const initialLoad = filteredChallenges.slice(0, ITEMS_PER_PAGE);
        setDisplayedChallenges(initialLoad);
        setPage(1);
        setHasMore(initialLoad.length < filteredChallenges.length);
    }
  }, [challenges, difficultyFilter]);

  useEffect(() => {
    if (!hasMore || isLoading || isChallengesLoading) return;
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
  }, [hasMore, isLoading, isChallengesLoading, loadMoreChallenges]);

  if (isLoading || !currentUser) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div>Loading...</div>
          </div>
      )
  }

  const difficultyFilters: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Missions</h2>
        </div>
        
        {advertisements.length > 0 && (
          <Carousel
            plugins={[autoplay.current]}
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={autoplay.current.reset}
            className="w-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {advertisements.map((ad) => (
                <CarouselItem key={ad.id}>
                  <Card className="bg-slate-900 text-white border-0 overflow-hidden">
                    <CardContent className="p-0 flex flex-col md:flex-row items-stretch justify-between gap-0 h-64">
                       <div className="w-full md:w-1/2 h-full">
                          <img src={ad.imageUrl || 'https://placehold.co/600x400'} alt={ad.title} className="w-full h-full object-cover" data-ai-hint="advertisement event" />
                        </div>
                      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
                          <h3 className="text-xl md:text-2xl font-bold leading-tight">{ad.title}</h3>
                          <p className="text-muted-foreground text-white/80 text-sm md:text-base mt-2">{ad.description}</p>
                          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto mt-6">
                            <Link href={ad.buttonLink || '#'} target="_blank" rel="noopener noreferrer">
                              {ad.buttonText || 'Learn More'}
                            </Link>
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 hidden md:flex" />
            <CarouselNext className="right-4 hidden md:flex" />
          </Carousel>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Challenges</h2>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                {difficultyFilters.map((filter) => (
                    <Button
                        key={filter}
                        variant={difficultyFilter === filter ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDifficultyFilter(filter)}
                        className="w-full sm:w-auto"
                    >
                        {filter}
                    </Button>
                ))}
            </div>
        </div>

        {isChallengesLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               {[...Array(6)].map((_, i) => (
                 <div key={`skeleton-initial-${i}`} className="flex flex-col space-y-3">
                   <Skeleton className="h-[125px] w-full rounded-xl" />
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-4/5" />
                     <Skeleton className="h-4 w-3/5" />
                   </div>
                 </div>
               ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {displayedChallenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  isCompleted={!!completedChallenges[challenge.id!]}
                  isInProgress={!!inProgressChallenges[challenge.id!]} 
                />
              ))}
            </div>
        )}
        
        {hasMore && !isChallengesLoading && (
          <div ref={loaderRef} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={`skeleton-loader-${i}`} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isChallengesLoading && filteredChallenges.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold tracking-tight">No Challenges Found</h3>
              <p className="text-muted-foreground">
                {difficultyFilter === 'All'
                  ? 'It seems there are no challenges available right now.'
                  : `No ${difficultyFilter.toLowerCase()} challenges found.`}
              </p>
          </div>
        )}
    </div>
  );
}
