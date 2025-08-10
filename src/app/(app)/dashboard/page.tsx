
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { type Challenge, challenges as initialChallenges } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, addDoc, writeBatch, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { UserData } from '@/lib/types';
import { ArrowRight, Award, Badge as BadgeIcon, Calendar, Trophy, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isChallengesLoading, setIsChallengesLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('All');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [topUser, setTopUser] = useState<UserData | null>(null);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const ITEMS_PER_PAGE = 6;
   const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setIsUserLoading(true);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;

            if (!userData.profileComplete) {
                router.push('/complete-profile');
                return;
            }
            setCurrentUser({ ...userData, uid: user.uid, email: user.email! });
          } else {
             router.push('/login');
          }
        });

        const completedChallengesSnap = await getDoc(doc(db, `users/${user.uid}/challengeData/completed`));
        setCompletedChallenges(completedChallengesSnap.exists() ? completedChallengesSnap.data() : {});
        
        const inProgressChallengesSnap = await getDoc(doc(db, `users/${user.uid}/challengeData/inProgress`));
        setInProgressChallenges(inProgressChallengesSnap.exists() ? inProgressChallengesSnap.data() : {});

        // Fetch user rank and top user
        const usersQuery = query(collection(db, 'users'), orderBy('points', 'desc'));
        const unsubscribeLeaderboard = onSnapshot(usersQuery, (snapshot) => {
            let rank = -1;
            snapshot.docs.forEach((doc, index) => {
                if (doc.id === user.uid) {
                    rank = index + 1;
                }
            });
            setUserRank(rank);
            if (snapshot.docs.length > 0 && snapshot.docs[0].id !== user.uid) {
                setTopUser(snapshot.docs[0].data() as UserData);
            } else {
                setTopUser(null);
            }
        });

        setIsUserLoading(false);

        return () => {
          unsubscribeUser();
          unsubscribeLeaderboard();
        }
      } else {
        router.push('/login');
        setIsUserLoading(false);
      }
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
      const challengesWithIds = initialChallenges.map((c, i) => ({...c, id: `fallback-${i}`}));
      setChallenges(challengesWithIds); 
    } finally {
      setIsChallengesLoading(false);
    }
  }, [db, toast]);

  useEffect(() => {
    if (!isUserLoading && currentUser) {
        fetchChallenges();
    }
  }, [isUserLoading, currentUser, fetchChallenges]);

  const filteredChallenges = useMemo(() => {
    if (!currentUser) return [];
    
    const languageFilter = currentUser.preferredLanguages && currentUser.preferredLanguages.length > 0;

    return challenges.filter(challenge => {
        const difficultyMatch = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
        const languageMatch = !languageFilter || currentUser.preferredLanguages!.some(lang => challenge.language === lang);
        return difficultyMatch && languageMatch;
    }).sort((a, b) => {
        const aCompleted = !!completedChallenges[a.id!];
        const bCompleted = !!completedChallenges[b.id!];
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        
        const aInProgress = !!inProgressChallenges[a.id!];
        const bInProgress = !!inProgressChallenges[b.id!];
        if (aInProgress !== bInProgress) return aInProgress ? -1 : 1;
        
        return 0;
    });
  }, [challenges, difficultyFilter, currentUser, completedChallenges, inProgressChallenges]);

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
    if (challenges.length > 0 && !isUserLoading) {
        const initialLoad = filteredChallenges.slice(0, ITEMS_PER_PAGE);
        setDisplayedChallenges(initialLoad);
        setPage(1);
        setHasMore(initialLoad.length < filteredChallenges.length);
    }
  }, [filteredChallenges, challenges.length, isUserLoading]);

  useEffect(() => {
    if (!hasMore || isUserLoading || isChallengesLoading) return;
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
  }, [hasMore, isUserLoading, isChallengesLoading, loadMoreChallenges]);

  const isLoading = isUserLoading || (isChallengesLoading && challenges.length === 0);

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div>Loading...</div>
          </div>
      )
  }

  const difficultyFilters: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2 md:hidden">
            <h2 className="text-3xl font-bold tracking-tight">Welcome {currentUser?.name.split(' ')[0]} 👋</h2>
        </div>
        <div className="hidden md:flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome {currentUser?.name} 👋</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
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
                              <img src={ad.imageUrl || 'https://placehold.co/600x400.png'} alt={ad.title} className="w-full h-full object-cover" data-ai-hint="advertisement event" />
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

            {isChallengesLoading && challenges.length === 0 ? (
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
                      : `No ${difficultyFilter.toLowerCase()} challenges found for your preferred languages.`}
                  </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Events</span>
                         <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            View <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardTitle>
                    <CardDescription>Challenges, podcasts & a lot more activities!</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-semibold">Live Now: {advertisements.length}</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold">Upcoming: 0</span>
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Leaderboard</span>
                         <Link href="/leaderboard" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            View <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={currentUser?.imageUrl} alt={currentUser?.name} />
                            <AvatarFallback>
                                <User />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{currentUser?.name}</p>
                            <p className="text-sm text-muted-foreground">Your Rank: <span className="font-semibold text-primary">{userRank ?? 'N/A'}</span></p>
                            <p className="text-sm text-muted-foreground">Your Score: <span className="font-semibold text-primary">{currentUser?.points ?? 0}</span></p>
                        </div>
                    </div>
                    {topUser && (
                         <div className="text-sm text-center bg-muted p-2 rounded-lg">
                            <p>You are chasing <span className="font-semibold">{topUser.name}</span> with {topUser.points} points! 🔥</p>
                         </div>
                    )}
                </CardContent>
            </Card>
          </aside>
        </div>
    </div>
  );
}

    