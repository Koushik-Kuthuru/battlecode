import Link from 'next/link';
import type { Challenge } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Award } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
}

export function ChallengeCard({ challenge, isCompleted }: ChallengeCardProps) {
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    Hard: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  };

  return (
    <Card className="flex h-full flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                {challenge.title}
            </CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{challenge.points} Points</span>
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {challenge.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/challenge/${challenge.id}`}>
            {isCompleted ? 'Review' : 'Start Challenge'} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
