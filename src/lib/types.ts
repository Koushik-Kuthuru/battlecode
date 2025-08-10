
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
