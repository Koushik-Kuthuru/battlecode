
'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { challenges as initialChallenges, type Challenge } from '@/lib/data'
import { useToast } from "@/hooks/use-toast"
import { CodeEditor } from "@/components/code-editor"

type FormData = Omit<Challenge, 'id' | 'tags'> & { tags: string };

export default function ManageChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false) // NEW: toggle for editor
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null)
  
  function getEmptyFormData(): FormData {
    return {
      title: '',
      difficulty: 'Easy',
      language: 'JavaScript',
      points: 10,
      description: '',
      tags: '',
      examples: [{ input: '', output: '' }],
      testCases: [{ input: '', output: '' }],
      solution: ''
    }
  }

  const [formData, setFormData] = useState<FormData>(getEmptyFormData())
  const [filter, setFilter] = useState({ language: 'all', difficulty: 'all' })
  const [sortBy, setSortBy] = useState('title')
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()


  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('challenges')
    if (stored) {
      setChallenges(JSON.parse(stored))
    } else {
      setChallenges(initialChallenges)
      localStorage.setItem('challenges', JSON.stringify(initialChallenges))
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('challenges', JSON.stringify(challenges))
    }
  }, [challenges, isClient])

  function handleInputChange(field: keyof Omit<FormData, 'examples' | 'testCases' | 'tags'>, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleArrayChange(arrayName: 'examples' | 'testCases', index: number, field: string, value: string) {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]]
      // @ts-ignore
      newArray[index] = { ...newArray[index], [field]: value }
      return { ...prev, [arrayName]: newArray }
    })
  }

  function addArrayItem(arrayName: 'examples' | 'testCases') {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { input: '', output: '' }]
    }))
  }

  function removeArrayItem(arrayName: 'examples' | 'testCases', index: number) {
    setFormData((prev) => ({
      ...prev,
      // @ts-ignore
      [arrayName]: prev[arrayName].filter((_: any, i: number) => i !== index)
    }))
  }

  function handleSolutionChange(value: string) {
    setFormData((prev) => ({ ...prev, solution: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const challengeToSave: Challenge = {
      ...formData,
      id: editingChallengeId || crypto.randomUUID(),
      tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingChallengeId) {
      setChallenges(prev =>
        prev.map(challenge =>
          challenge.id === editingChallengeId ? challengeToSave : challenge
        )
      )
      toast({ title: "Challenge updated successfully" })
    } else {
      setChallenges(prev => [...prev, challengeToSave])
      toast({ title: "Challenge created successfully" })
    }
    resetForm()
  }

  function resetForm() {
    setFormData(getEmptyFormData())
    setEditingChallengeId(null)
    setIsFormVisible(false)
    setShowCodeEditor(false)
  }

  function handleEdit(challenge: Challenge) {
    setFormData({
        ...challenge,
        tags: Array.isArray(challenge.tags) ? challenge.tags.join(', ') : '',
    })
    setEditingChallengeId(challenge.id)
    setIsFormVisible(true)
    setShowCodeEditor(false) // start hidden even in edit mode
  }

  const filteredChallenges = challenges
    .filter(c => filter.language === 'all' || c.language === filter.language)
    .filter(c => filter.difficulty === 'all' || c.difficulty === filter.difficulty)
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
      }
      return 0
    })

  if (!isClient) return null

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Manage Challenges</h1>

      <div className="mb-4 flex space-x-2">
        <Button onClick={() => { setIsFormVisible(true); setShowCodeEditor(false); setFormData(getEmptyFormData()); setEditingChallengeId(null) }}>
          Add New Challenge
        </Button>
        <Select onValueChange={(value) => setFilter(f => ({ ...f, language: value }))} value={filter.language}>
          <SelectTrigger><SelectValue placeholder="Filter by Language" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="C++">C++</SelectItem>
            <SelectItem value="Java">Java</SelectItem>
            <SelectItem value="Python">Python</SelectItem>
            <SelectItem value="JavaScript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFilter(f => ({ ...f, difficulty: value }))} value={filter.difficulty}>
          <SelectTrigger><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setSortBy('title')}>Sort by Title</Button>
        <Button variant="outline" onClick={() => setSortBy('difficulty')}>Sort by Difficulty</Button>
      </div>

      {isFormVisible && (
        <Card className="mb-8">
          <CardContent className="space-y-4 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => handleInputChange('title', e.target.value)} />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="C++">C++</SelectItem>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={e => handleInputChange('points', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={formData.tags} onChange={e => setFormData(prev => ({...prev, tags: e.target.value}))} />
              </div>

              <Tabs defaultValue="examples">
                <TabsList>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="testCases">Test Cases</TabsTrigger>
                </TabsList>
                <TabsContent value="examples">
                  {formData.examples.map((ex: any, i: number) => (
                    <div key={i} className="mb-2 flex space-x-2">
                      <Input placeholder="Input" value={ex.input} onChange={e => handleArrayChange('examples', i, 'input', e.target.value)} />
                      <Input placeholder="Output" value={ex.output} onChange={e => handleArrayChange('examples', i, 'output', e.target.value)} />
                      <Button type="button" variant="destructive" onClick={() => removeArrayItem('examples', i)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => addArrayItem('examples')}>Add Example</Button>
                </TabsContent>
                <TabsContent value="testCases">
                  {formData.testCases.map((tc: any, i: number) => (
                    <div key={i} className="mb-2 flex space-x-2">
                      <Input placeholder="Input" value={tc.input} onChange={e => handleArrayChange('testCases', i, 'input', e.target.value)} />
                      <Input placeholder="Output" value={tc.output} onChange={e => handleArrayChange('testCases', i, 'output', e.target.value)} />
                      <Button type="button" variant="destructive" onClick={() => removeArrayItem('testCases', i)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => addArrayItem('testCases')}>Add Test Case</Button>
                </TabsContent>
              </Tabs>

              {/* Toggle Button for Code Editor */}
              <Button type="button" variant="secondary" onClick={() => setShowCodeEditor(prev => !prev)}>
                {showCodeEditor ? "Hide Solution Code" : "Add/Edit Solution Code"}
              </Button>

              {showCodeEditor && (
                <div>
                  <Label>Solution Code</Label>
                  <div className="h-64 rounded-md border">
                    <CodeEditor
                      value={formData.solution}
                      onChange={handleSolutionChange}
                      language={formData.language.toLowerCase()}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button type="submit">{editingChallengeId ? 'Update Challenge' : 'Create Challenge'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.map(challenge => (
          <Card key={challenge.id}>
            <CardHeader>
              <CardTitle>{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
              <p><strong>Language:</strong> {challenge.language}</p>
              <p><strong>Points:</strong> {challenge.points}</p>
              <Button onClick={() => handleEdit(challenge)}>Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

    