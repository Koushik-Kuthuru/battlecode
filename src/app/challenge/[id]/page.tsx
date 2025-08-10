
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
import { Save, RefreshCcw, Code, Bug, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChallenge } from "../layout";
import { evaluateCode, type EvaluateCodeOutput } from "@/ai/flows/evaluate-code";

export default function ChallengeDetail() {
  const { challenge, setRunResult, setActiveTab } = useChallenge();
  const { toast } = useToast();
  const [solution, setSolution] = useState("");
  const [language, setLanguage] = useState('python');
  const [initialSolution, setInitialSolution] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!challenge) return;

    const fetchSolution = async () => {
      setLanguage(challenge.language.toLowerCase());

      let userCode = challenge.solution; // Default to starter code

      if (user) {
        const solRef = doc(db, `users/${user.uid}/solutions`, challenge.id!);
        const solSnap = await getDoc(solRef);
        if (solSnap.exists()) {
          userCode = solSnap.data().code;
          setLanguage(solSnap.data().language || challenge.language.toLowerCase());
        }
      }
      setSolution(userCode);
      setInitialSolution(userCode);
    };

    fetchSolution();
  }, [challenge, user, db]);


  const handleSolutionChange = (newCode: string) => {
    setSolution(newCode);
  };
  
  const handleSave = async () => {
    if (!user || !challenge) {
       toast({ variant: "destructive", title: "Error", description: "You must be logged in to save your progress." });
       return;
    }
    setIsSaving(true);
    try {
        const solRef = doc(db, `users/${user.uid}/solutions`, challenge.id!);
        await setDoc(solRef, { code: solution, language, updatedAt: new Date() }, { merge: true });
        const inProgressRef = doc(db, `users/${user.uid}/challengeData`, 'inProgress');
        await setDoc(inProgressRef, { [challenge.id!]: true }, { merge: true });
        toast({ title: "Progress Saved!", description: "Your code has been saved successfully." });
        setInitialSolution(solution);
    } catch (error) {
        console.error("Failed to save solution:", error);
         toast({ variant: "destructive", title: "Save Failed", description: "Could not save your code. Please try again." });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleRunCode = async () => {
    if (!challenge) return;
    setIsRunning(true);
    setRunResult(null); // Clear previous results
    setActiveTab('result'); // Switch to result tab
    try {
        const result = await evaluateCode({
            code: solution,
            programmingLanguage: language,
            problemDescription: challenge.description,
            testCases: challenge.testCases,
        });
        setRunResult(result);
    } catch(error) {
        console.error("Error running code:", error);
        toast({ variant: "destructive", title: "Evaluation Error", description: "Could not evaluate your code. Please try again." });
    } finally {
        setIsRunning(false);
    }
  }
  
  const handleSubmit = async () => {
    if (!user || !challenge) {
        toast({ variant: "destructive", title: "Submission Error", description: "You must be logged in to submit." });
        return;
    }
    setIsSubmitting(true);
    setRunResult(null);
    setActiveTab('result');
    try {
      const result = await evaluateCode({
            code: solution,
            programmingLanguage: language,
            problemDescription: challenge.description,
            testCases: challenge.testCases,
      });
      setRunResult(result);

      if (result.allPassed) {
          // Update user points and mark as completed
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const currentPoints = userSnap.data()?.points || 0;
          await updateDoc(userRef, { points: currentPoints + challenge.points });

          const completedRef = doc(db, `users/${user.uid}/challengeData`, 'completed');
          await setDoc(completedRef, { [challenge.id!]: true }, { merge: true });
          
          const inProgressRef = doc(db, `users/${user.uid}/challengeData`, 'inProgress');
          await setDoc(inProgressRef, { [challenge.id!]: false }, { merge: true });
          
          toast({ title: "Challenge Passed!", description: `You've earned ${challenge.points} points!` });
      } else {
          toast({ variant: "destructive", title: "Submission Failed", description: "Your solution did not pass all test cases." });
      }

    } catch (error) {
      console.error("Error submitting code:", error);
      toast({ variant: "destructive", title: "Submission Error", description: "An error occurred during submission." });
    } finally {
      setIsSubmitting(false);
    }
  }


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
           <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving || isRunning || isSubmitting}><RefreshCcw className="mr-2 h-4 w-4" /> Reset</Button>
           <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || isRunning || isSubmitting}>
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Save
           </Button>
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
           <Button size="sm" onClick={handleRunCode} disabled={isSaving || isRunning || isSubmitting}>
             {isRunning ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Code className="mr-2 h-4 w-4" />} Run Code
           </Button>
           <Button size="sm" variant="default" onClick={handleSubmit} disabled={isSaving || isRunning || isSubmitting}>
             {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Bug className="mr-2 h-4 w-4" />} Submit
           </Button>
       </div>
    </div>
  );
}
