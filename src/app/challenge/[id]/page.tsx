
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CodeEditor } from "@/components/code-editor";
import { app, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import type { Challenge } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengeDetail() {
  const params = useParams();
  const { toast } = useToast();
  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [solution, setSolution] = useState("");
  const [initialSolution, setInitialSolution] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!challengeId) return;
    const fetchChallenge = async () => {
      setIsLoading(true);
      const docRef = doc(db, "challenges", challengeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const challengeData = { id: docSnap.id, ...docSnap.data() } as Challenge;
        setChallenge(challengeData);
        
        // Only try to fetch solution if user is loaded
        if (user) {
            const solRef = doc(db, `users/${user.uid}/solutions`, challengeData.id!);
            const solSnap = await getDoc(solRef);
            const userCode = solSnap.exists() ? solSnap.data().code : challengeData.solution;
            setSolution(userCode);
            setInitialSolution(userCode);
        } else if (user === null) { // User is not logged in
            setSolution(challengeData.solution);
            setInitialSolution(challengeData.solution);
        }

      } else {
        setChallenge(null);
      }
      setIsLoading(false);
    };

    // We need the user to be loaded before we can fetch their solution
    // user !== undefined means onAuthStateChanged has run at least once
    if(user !== undefined) {
        fetchChallenge();
    }
  }, [challengeId, user, db]);


  const handleSolutionChange = (newCode: string) => {
    setSolution(newCode);
  };
  
  const handleSave = async () => {
    if (!user || !challengeId || !challenge) {
       toast({
         variant: "destructive",
         title: "Error",
         description: "You must be logged in to save your progress.",
       });
       return;
    }

    try {
        const solRef = doc(db, `users/${user.uid}/solutions`, challengeId);
        await setDoc(solRef, {
          code: solution,
          updatedAt: new Date(),
        }, { merge: true });

        const inProgressRef = doc(db, `users/${user.uid}/challengeData`, 'inProgress');
        await setDoc(inProgressRef, { [challenge.id!]: true }, { merge: true });

        toast({
            title: "Progress Saved!",
            description: "Your code has been saved successfully.",
        });
        setInitialSolution(solution); // Update the baseline for reset
    } catch (error) {
        console.error("Failed to save solution:", error);
         toast({
           variant: "destructive",
           title: "Save Failed",
           description: "Could not save your code. Please try again.",
         });
    }
  };

  const handleReset = () => {
      if(window.confirm("Are you sure you want to reset your code to your last saved version?")) {
          setSolution(initialSolution);
      }
  };

  if (isLoading || !challenge) {
    return (
      <div className="h-full w-full p-4">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-full relative flex flex-col">
       <div className="flex-grow relative">
            <CodeEditor
              value={solution}
              onChange={handleSolutionChange}
              language={challenge.language.toLowerCase()}
            />
       </div>
       <div className="flex-shrink-0 p-2 flex justify-end items-center gap-2 border-t bg-background">
           <Button variant="outline" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save</Button>
           <Button variant="destructive-outline" onClick={handleReset}><RefreshCcw className="mr-2 h-4 w-4" /> Reset</Button>
       </div>
    </div>
  );
}
