
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CodeEditor } from "@/components/code-editor";
import { app, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import type { Challenge } from "@/lib/data";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
      // If we have challenge data but the user logs out, stop loading.
      if (!currentUser && challenge) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, challenge]);

  useEffect(() => {
    if (!challengeId) return;
    const fetchChallenge = async () => {
      setIsLoading(true);
      const docRef = doc(db, "challenges", challengeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const challengeData = { id: docSnap.id, ...docSnap.data() } as Challenge;
        setChallenge(challengeData);
        // If user is already known to be null, stop loading
        if (auth.currentUser === null) {
          setSolution(challengeData.solution); 
          setIsLoading(false);
        }
      } else {
        setChallenge(null);
        setIsLoading(false); // Challenge not found
      }
    };
    fetchChallenge();
  }, [challengeId, auth]);

  useEffect(() => {
    if (!challenge) {
        // If challenge isn't loaded yet, or not found, we wait.
        return;
    };

    if (user) {
        // User is logged in, fetch their saved solution
        const fetchSolution = async () => {
          const solRef = doc(db, `users/${user.uid}/solutions`, challenge.id!);
          const solSnap = await getDoc(solRef);
          if (solSnap.exists()) {
            setSolution(solSnap.data().code);
          } else {
            // No saved solution, use the default from the challenge
            setSolution(challenge.solution);
          }
          setIsLoading(false); // Done loading
        };
        fetchSolution();
    } else {
        // User is not logged in, use default solution
        setSolution(challenge.solution);
        setIsLoading(false); // Done loading
    }
  }, [user, challenge, db]);

  const handleSolutionChange = async (newCode: string) => {
    setSolution(newCode);
    if (!user || !challengeId) return;

    try {
        const solRef = doc(db, `users/${user.uid}/solutions`, challengeId);
        await setDoc(solRef, {
          code: newCode,
          updatedAt: new Date(),
        }, { merge: true });

        const inProgressRef = doc(db, `users/${user.uid}/challengeData`, 'inProgress');
        await setDoc(inProgressRef, { [challengeId]: true }, { merge: true });
    } catch (error) {
        console.error("Failed to save solution:", error);
    }
  };

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center">Loading challenge...</div>;
  }
  
  if (!challenge) {
     return <div className="flex h-full w-full items-center justify-center">Challenge not found.</div>;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <ScrollArea className="h-full p-6">
            <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
            <div className="flex items-center gap-4 mb-4">
                <Badge variant={challenge.difficulty === 'Easy' ? 'secondary' : challenge.difficulty === 'Medium' ? 'outline' : 'destructive'}>{challenge.difficulty}</Badge>
                <p className="text-sm text-muted-foreground">Language: {challenge.language}</p>
                <p className="text-sm font-bold text-primary">{challenge.points} Points</p>
            </div>
            <p className="text-base mb-6">{challenge.description}</p>
            
            <h2 className="text-xl font-semibold mb-3">Examples</h2>
            {challenge.examples.map((example, index) => (
              <div key={index} className="bg-muted p-4 rounded-md mb-4">
                <p className="font-mono text-sm"><strong>Input:</strong> {example.input}</p>
                <p className="font-mono text-sm"><strong>Output:</strong> {example.output}</p>
                {example.explanation && <p className="text-sm mt-2 text-muted-foreground"><strong>Explanation:</strong> {example.explanation}</p>}
              </div>
            ))}

            <div className="flex flex-wrap gap-2 mt-6">
                {challenge.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
         <div className="h-full relative">
            <CodeEditor
              value={solution}
              onChange={handleSolutionChange}
              language={challenge.language.toLowerCase()}
            />
         </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
