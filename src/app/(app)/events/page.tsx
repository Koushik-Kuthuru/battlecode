
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Calendar, Podcast, Users, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Placeholder data
const events = [
  {
    id: '1',
    title: 'Live Podcast: Cracking the FAANG Interview',
    type: 'Podcast',
    status: 'live',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'podcast interview',
    description: 'Join industry experts as they break down the tips and tricks to ace your next technical interview at a top tech company.',
    startDate: '2024-08-15T10:00:00Z',
    endDate: '2024-08-15T11:00:00Z',
    enrolled: 128,
  },
  {
    id: '2',
    title: 'Weekend Coding Challenge: Dynamic Programming',
    type: 'Challenge',
    status: 'upcoming',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'coding challenge',
    description: 'Test your DP skills in this 48-hour coding marathon. Prizes for top 3 solvers!',
    startDate: '2024-08-24T18:00:00Z',
    endDate: '2024-08-26T18:00:00Z',
    enrolled: 256,
  },
  {
    id: '3',
    title: 'Past Event: Intro to Competitive Programming',
    type: 'Workshop',
    status: 'past',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'workshop computer',
    description: 'A look back at our introductory workshop that kicked off the season. Watch the recording now.',
    startDate: '2024-07-20T09:00:00Z',
    endDate: '2024-07-20T12:00:00Z',
    enrolled: 450,
  },
  {
    id: '4',
    title: 'Data Structures Deep Dive: Trees & Graphs',
    type: 'Workshop',
    status: 'upcoming',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'data structures',
    description: 'An interactive workshop covering advanced topics in trees and graph traversals. Essential for complex problem-solving.',
    startDate: '2024-09-05T14:00:00Z',
    endDate: '2024-09-05T16:00:00Z',
    enrolled: 78,
  },
];

const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Podcast':
            return <Podcast className="h-4 w-4" />;
        case 'Challenge':
            return <Video className="h-4 w-4" />;
        case 'Workshop':
            return <Users className="h-4 w-4" />;
        default:
            return <Calendar className="h-4 w-4" />;
    }
}

function EventCard({ event }: { event: (typeof events)[0] }) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <Card className="flex flex-col overflow-hidden transition-transform hover:scale-105">
      <CardHeader className="p-0">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint={event.aiHint}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <EventIcon type={event.type} />
            <span>{event.type}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(event.startDate)}</span>
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{event.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{event.enrolled} Enrolled</span>
        </div>
        <Button asChild size="sm" variant="ghost">
            <Link href="#">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function EventsPage() {
  const [eventTypeFilter, setEventTypeFilter] = useState('All');

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.endDate) >= now && e.status !== 'past');
  const pastEvents = events.filter(e => new Date(e.endDate) < now || e.status === 'past');

  const filterEvents = (eventList: typeof events) => {
    if (eventTypeFilter === 'All') return eventList;
    return eventList.filter(e => e.type === eventTypeFilter);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">Discover workshops, challenges, and live sessions.</p>
        </div>
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Podcast">Podcast</SelectItem>
                <SelectItem value="Challenge">Challenge</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="upcoming">Upcoming & Live</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterEvents(upcomingEvents).map(event => <EventCard key={event.id} event={event} />)}
            </div>
             {filterEvents(upcomingEvents).length === 0 && (
                <div className="text-center py-16 text-muted-foreground">No upcoming events match your filter.</div>
            )}
        </TabsContent>
        <TabsContent value="past" className="mt-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterEvents(pastEvents).map(event => <EventCard key={event.id} event={event} />)}
            </div>
            {filterEvents(pastEvents).length === 0 && (
                <div className="text-center py-16 text-muted-foreground">No past events match your filter.</div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
