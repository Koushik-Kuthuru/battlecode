

import { Timestamp } from "firebase/firestore";

export type UserData = {
    uid: string;
    email: string;
    name: string;
    studentId: string;
    points: number;
    branch: string;
    year: string;
    section: string;
    profileComplete?: boolean;
    imageUrl?: string;
    lastSeen?: Timestamp;
    preferredLanguages?: string[];
};

export type Event = {
  id: string;
  title: string;
  type: 'Podcast' | 'Challenge' | 'Workshop';
  imageUrl: string;
  aiHint: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  enrolled: number;
  isEnabled: boolean;
  createdAt: Timestamp;
  status: 'live' | 'upcoming' | 'past';
};
