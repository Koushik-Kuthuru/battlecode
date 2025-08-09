
'use client';

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { Skeleton } from './ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

const languageMap: Record<string, any> = {
  javascript: javascript({ jsx: true }),
  python: python(),
  java: java(),
  c: cpp(), // CodeMirror uses cpp for C as well
  'c++': cpp(),
  cpp: cpp(),
};

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const langExtension = language ? languageMap[language.toLowerCase()] : javascript();

  // The 'use client' directive above ensures this component only renders on the client
  // so we can safely assume window is available and avoid hydration errors.
  const isClient = typeof window !== 'undefined';
  
  if (!isClient) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="absolute inset-0">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[langExtension]}
        onChange={onChange}
        theme={oneDark}
        style={{
          fontSize: '14px',
          height: '100%',
        }}
      />
    </div>
  );
}
