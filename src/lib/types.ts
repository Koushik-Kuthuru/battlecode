
import { Timestamp } from "firebase/firestore";

export type UserData = {
    uid: string;
    email: string;
    name: string;
    studentId: string;
    points: number;
    branch: string;
    year: string;
    imageUrl?: string;
    lastSeen?: Timestamp;
    preferredLanguages?: string[];
};
