
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, collectionGroup, query, where, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Challenge } from '@/lib/data';
import { Flame, ListChecks, Users } from 'lucide-react';

type AnalyticsData = {
  totalUsers: number;
  totalChallenges: number;
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
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [usersSnapshot, challengesSnapshot, completedSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'challenges')),
          getDocs(collectionGroup(db, 'completed'))
        ]);
        
        // --- Calculate Stats ---
        const totalUsers = usersSnapshot.size;
        const totalChallenges = challengesSnapshot.size;

        const challengesMap = new Map<string, string>();
        challengesSnapshot.docs.forEach(doc => {
            challengesMap.set(doc.id, doc.data().title);
        });

        // Most Solved Challenge
        const completionCounts: Record<string, number> = {};
        completedSnapshot.forEach(doc => {
            const data = doc.data();
            Object.keys(data).forEach(challengeId => {
                if (data[challengeId]) { // Check if the value is true
                     completionCounts[challengeId] = (completionCounts[challengeId] || 0) + 1;
                }
            });
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
        
        setAnalytics({ totalUsers, totalChallenges, mostSolvedChallenge });

        // --- Prepare Chart Data ---
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const sevenDaysAgo = Timestamp.fromDate(last7Days);

        const completionsByDay: Record<string, number> = {};
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          completionsByDay[formattedDate] = 0;
        }

        completedSnapshot.forEach(doc => {
            const data = doc.data();
            Object.keys(data).forEach(challengeId => {
                const completedTimestamp = data[challengeId]?.completedAt;
                if (completedTimestamp && completedTimestamp instanceof Timestamp && completedTimestamp >= sevenDaysAgo) {
                    const date = completedTimestamp.toDate();
                    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (completionsByDay[formattedDate] !== undefined) {
                        completionsByDay[formattedDate]++;
                    }
                }
            });
        });

        const finalChartData = Object.entries(completionsByDay).map(([date, completions]) => ({
            date,
            completions
        })).reverse();
        
        setChartData(finalChartData);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [db]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={analytics?.totalUsers ?? 0} icon={Users} />
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
