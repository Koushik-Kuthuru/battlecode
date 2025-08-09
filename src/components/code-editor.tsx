
'use client';

import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useTheme } from 'next-themes';
import { Skeleton } from './ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const handleIllegalAction = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const editorLanguage = language?.toLowerCase() === 'c++' ? 'cpp' : language?.toLowerCase();

  return (
    <div
      onCopy={handleIllegalAction}
      onPaste={handleIllegalAction}
      onCut={handleIllegalAction}
      className="absolute inset-0"
    >
      <Editor
        height="100%"
        language={editorLanguage}
        value={value}
        onChange={onChange}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          contextmenu: false,
          padding: {
            top: 16,
            bottom: 16,
          },
        }}
        loading={<Skeleton className="h-full w-full" />}
      />
    </div>
  );
}
