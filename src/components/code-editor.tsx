
'use client';

import React, { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
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
  c: cpp(),
  'c++': cpp(),
  cpp: cpp(),
};

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const langExtension = language ? languageMap[language.toLowerCase()] : javascript();

  useEffect(() => {
    const editorElement = editorRef.current;

    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
      }
    };
    
    if (editorElement) {
        editorElement.addEventListener('contextmenu', handleContextmenu);
        editorElement.addEventListener('keydown', handleKeydown);
    }

    return () => {
        if (editorElement) {
            editorElement.removeEventListener('contextmenu', handleContextmenu);
            editorElement.removeEventListener('keydown', handleKeydown);
        }
    };
  }, []);
  
  const isClient = typeof window !== 'undefined';
  if (!isClient) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="absolute inset-0" ref={editorRef}>
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
