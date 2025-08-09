
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Challenge
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>
              From here, you can manage all the challenges on the SMEC Battle Code platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Select an option from the sidebar to get started.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
