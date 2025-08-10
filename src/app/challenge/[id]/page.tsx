
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
import { Save, RefreshCcw, Code, Bug, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChallengeDetail() {
  const params = useParams();
  const { toast } = useToast();
  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [solution, setSolution] = useState("");
  const [language, setLanguage] = useState('python');
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

    const fetchChallengeAndSolution = async () => {
      setIsLoading(true);
      try {
        const challengeRef = doc(db, "challenges", challengeId);
        const challengeSnap = await getDoc(challengeRef);

        if (challengeSnap.exists()) {
          const challengeData = { id: challengeSnap.id, ...challengeSnap.data() } as Challenge;
          setChallenge(challengeData);
          setLanguage(challengeData.language.toLowerCase());

          let userCode = challengeData.solution; // Default to starter code

          if (user) {
            const solRef = doc(db, `users/${user.uid}/solutions`, challengeId);
            const solSnap = await getDoc(solRef);
            if (solSnap.exists()) {
              userCode = solSnap.data().code;
            }
          }
          setSolution(userCode);
          setInitialSolution(userCode);
        } else {
          setChallenge(null);
        }
      } catch (error) {
        console.error("Error fetching challenge details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load challenge details."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengeAndSolution();
  }, [challengeId, user, db, toast]);


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
        setInitialSolution(solution);
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

  return (
    <div className="h-full w-full flex flex-col bg-background">
       <div className="flex-shrink-0 p-2 flex justify-between items-center border-b">
         <Select value={language} onValueChange={setLanguage}>
             <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Select language" />
             </SelectTrigger>
             <SelectContent>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="c++">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
             </SelectContent>
         </Select>
         <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleReset}><RefreshCcw className="mr-2 h-4 w-4" /> Reset</Button>
           <Button variant="outline" size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save</Button>
         </div>
       </div>
       <div className="flex-grow relative">
          <CodeEditor
            value={solution}
            onChange={handleSolutionChange}
            language={language}
          />
       </div>
       <div className="flex-shrink-0 p-2 flex justify-end items-center gap-2 border-t">
           <Button size="sm"><Code className="mr-2"/> Run Code</Button>
           <Button size="sm" variant="default"><Bug className="mr-2"/> Submit</Button>
       </div>
    </div>
  );
}
