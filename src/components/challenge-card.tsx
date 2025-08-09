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
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500',
  };

  return (
    <Card className="flex h-full flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                {challenge.title}
            </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${difficultyColors[challenge.difficulty]}`} />
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
