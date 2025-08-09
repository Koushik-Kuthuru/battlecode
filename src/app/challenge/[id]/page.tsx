"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CodeEditor } from "@/components/code-editor";
import { app, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import type { Challenge } from "@/lib/data";

export default function ChallengeDetail() {
  const params = useParams();
  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [solution, setSolution] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch challenge data
  useEffect(() => {
    if (!challengeId) return;
    const fetchChallenge = async () => {
      setIsLoading(true);
      const docRef = doc(db, "challenges", challengeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChallenge({ id: docSnap.id, ...docSnap.data() } as Challenge);
      }
      // setIsLoading(false) will be handled after fetching solution
    };
    fetchChallenge();
  }, [challengeId]);

  // Fetch user’s saved solution
  useEffect(() => {
    if (!user || !challengeId) {
      if(challenge) setIsLoading(false); // If there's a challenge but no user, stop loading
      return;
    };

    const fetchSolution = async () => {
      const solRef = doc(db, `users/${user.uid}/solutions`, challengeId);
      const solSnap = await getDoc(solRef);
      if (solSnap.exists()) {
        setSolution(solSnap.data().code);
      } else if (challenge) {
        setSolution(challenge.solution); // Start with default solution if none saved
      }
      setIsLoading(false);
    };

    fetchSolution();
  }, [user, challengeId, challenge]);

  // Auto-save to cloud
  const saveSolution = async (newCode: string) => {
    setSolution(newCode);
    if (!user || !challengeId) return;

    const solRef = doc(db, `users/${user.uid}/solutions`, challengeId);
    await setDoc(solRef, {
      code: newCode,
      updatedAt: new Date(),
    }, { merge: true });

    const inProgressRef = doc(db, `users/${user.uid}/challengeData/inProgress`);
    await setDoc(inProgressRef, { [challengeId]: true }, { merge: true });
  };

  if (isLoading || !challenge) {
    return <div className="flex h-full items-center justify-center">Loading challenge...</div>;
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold mb-1">{challenge.title}</h1>
        <p className="text-muted-foreground">{challenge.description}</p>
      </div>

      <div className="flex-grow relative border rounded-md overflow-hidden">
        <CodeEditor
          value={solution}
          onChange={(val) => saveSolution(val)}
          language={challenge.language.toLowerCase()}
        />
      </div>
    </div>
  );
}
