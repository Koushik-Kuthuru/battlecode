
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, collectionGroup, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Challenge } from '@/lib/data';
import { Flame, ListChecks, Users, Wifi } from 'lucide-react';

type AnalyticsData = {
  totalUsers: number;
  totalChallenges: number;
  activeUsers: number;
  mostSolvedChallenge: string;
};

type ChartData = {
  date: string;
  completions: number;
}[];

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // We only need to fetch static data once
      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const totalChallenges = challengesSnapshot.size;
      const challengesMap = new Map<string, string>();
      challengesSnapshot.docs.forEach(doc => {
          challengesMap.set(doc.id, doc.data().title);
      });

      // Set up real-time listener for users
      const usersQuery = query(collection(db, 'users'));
      const unsubscribeUsers = onSnapshot(usersQuery, (usersSnapshot) => {
        const totalUsers = usersSnapshot.size;
        let activeUsers = 0;
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.lastSeen && (new Date().getTime() - userData.lastSeen.toDate().getTime()) < 5 * 60 * 1000) {
                activeUsers++;
            }
        });
        setAnalytics(prev => ({...prev, totalUsers, activeUsers, totalChallenges} as AnalyticsData));
      });

      // Set up real-time listener for completions
       const completedQuery = query(collectionGroup(db, 'challengeData'));
       const unsubscribeCompletions = onSnapshot(completedQuery, (completedSnapshot) => {
            // Most Solved Challenge
            const completionCounts: Record<string, number> = {};
            // Chart Data
            const completionsByDay: Record<string, number> = {};
            const today = new Date();
            for (let i = 0; i < 7; i++) {
              const date = new Date(today);
              date.setDate(date.getDate() - i);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              completionsByDay[formattedDate] = 0;
            }

            completedSnapshot.forEach(doc => {
                if (doc.id === 'completed') {
                    const data = doc.data();
                    Object.keys(data).forEach(challengeId => {
                        const completedInfo = data[challengeId];
                        if (completedInfo && completedInfo.completedAt && completedInfo.completedAt instanceof Timestamp) {
                             // Tally for most solved
                             completionCounts[challengeId] = (completionCounts[challengeId] || 0) + 1;
                             
                             // Tally for chart
                             const completedTimestamp = completedInfo.completedAt;
                             const sevenDaysAgo = new Date();
                             sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                             if (completedTimestamp.toDate() >= sevenDaysAgo) {
                                const date = completedTimestamp.toDate();
                                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                if (completionsByDay[formattedDate] !== undefined) {
                                    completionsByDay[formattedDate]++;
                                }
                             }
                        }
                    });
                }
            });

            let mostSolvedId = 'N/A';
            let maxCompletions = 0;
            Object.entries(completionCounts).forEach(([challengeId, count]) => {
                if (count > maxCompletions) {
                    maxCompletions = count;
                    mostSolvedId = challengeId;
                }
            });
            const mostSolvedChallenge = challengesMap.get(mostSolvedId) || 'N/A';
            setAnalytics(prev => ({...prev, mostSolvedChallenge} as AnalyticsData));

            const finalChartData = Object.entries(completionsByDay).map(([date, completions]) => ({
                date,
                completions
            })).reverse();
            setChartData(finalChartData);
            setIsLoading(false);
       });
       
       return () => {
        unsubscribeUsers();
        unsubscribeCompletions();
       }

    };

    fetchAnalytics().catch(console.error);
  }, [db]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={analytics?.totalUsers ?? 0} icon={Users} />
        <StatCard title="Active Users" value={analytics?.activeUsers ?? 0} icon={Wifi} />
        <StatCard title="Total Challenges" value={analytics?.totalChallenges ?? 0} icon={ListChecks} />
        <StatCard title="Most Solved Challenge" value={analytics?.mostSolvedChallenge ?? 'N/A'} icon={Flame} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Completion Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {chartData ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completions" fill="hsl(var(--primary))" name="Completions" />
              </BarChart>
            ) : (
                <div className="flex items-center justify-center h-full">Loading chart data...</div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

    