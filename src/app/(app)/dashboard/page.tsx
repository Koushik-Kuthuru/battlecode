'use client';

import { useState, useEffect, useRef } from 'react';
import { ChallengeCard } from '@/components/challenge-card';
import { challenges, type Challenge } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const languages = ['All', 'C', 'C++', 'Java', 'Python', 'JavaScript'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const ITEMS_PER_PAGE = 6;

export default function DashboardPage() {
  const [difficulty, setDifficulty] = useState('All');
  const [language, setLanguage] = useState('All');
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const filteredChallenges = challenges.filter((c) => {
    const difficultyMatch = difficulty === 'All' || c.difficulty === difficulty;
    const languageMatch = language === 'All' || c.language === language;
    return difficultyMatch && languageMatch;
  });
  
  const loadMoreChallenges = () => {
    const next_page = page + 1;
    const newChallenges = filteredChallenges.slice(0, next_page * ITEMS_PER_PAGE);
    setDisplayedChallenges(newChallenges);
    setPage(next_page);
    if(newChallenges.length >= filteredChallenges.length) {
      setHasMore(false);
    }
  }

  useEffect(() => {
    const initialChallenges = filteredChallenges.slice(0, ITEMS_PER_PAGE);
    setDisplayedChallenges(initialChallenges);
    setPage(1);
    setHasMore(initialChallenges.length < filteredChallenges.length);
  }, [difficulty, language]);

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
  }, [hasMore, page, filteredChallenges]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">Sharpen your skills with our curated challenges.</p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Tabs value={difficulty} onValueChange={setDifficulty}>
            <TabsList>
              {difficulties.map((d) => (
                <TabsTrigger key={d} value={d}>
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
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
