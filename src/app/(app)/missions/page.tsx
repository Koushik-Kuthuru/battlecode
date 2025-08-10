
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserData } from '@/lib/types';

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
type Status = 'All' | 'Completed' | 'In Progress' | 'Not Started';

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
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChallengesLoading, setIsChallengesLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('All');
  const [statusFilter, setStatusFilter] = useState<Status>('All');
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const ITEMS_PER_PAGE = 6;
   const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setIsLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserData;

          if (!userData.profileComplete) {
              router.push('/complete-profile');
              return;
          }

          setCurrentUser({ ...userData, uid: user.uid, email: user.email! });
          
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

  const filteredChallenges = useMemo(() => {
    if (!currentUser) return [];

    const languageFilter = currentUser.preferredLanguages && currentUser.preferredLanguages.length > 0;
    
    return challenges.filter(challenge => {
      const difficultyMatch = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
      const languageMatch = !languageFilter || currentUser.preferredLanguages!.includes(challenge.language);

      const isCompleted = !!completedChallenges[challenge.id!];
      const isInProgress = !!inProgressChallenges[challenge.id!] && !isCompleted;

      const statusMatch = () => {
          switch (statusFilter) {
              case 'Completed':
                  return isCompleted;
              case 'In Progress':
                  return isInProgress;
              case 'Not Started':
                  return !isCompleted && !isInProgress;
              case 'All':
              default:
                  return true;
          }
      };
      
      return difficultyMatch && statusMatch() && languageMatch;
    });
  }, [challenges, difficultyFilter, statusFilter, currentUser, completedChallenges, inProgressChallenges]);

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
  }, [filteredChallenges, challenges.length]);


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
  const statusFilters: Status[] = ['All', 'Not Started', 'In Progress', 'Completed'];


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
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
              </Select>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto">
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
                {difficultyFilter === 'All' && statusFilter === 'All'
                  ? 'It seems there are no challenges available right now.'
                  : `No challenges found for the selected filters.`}
              </p>
          </div>
        )}
    </div>
  );
}
