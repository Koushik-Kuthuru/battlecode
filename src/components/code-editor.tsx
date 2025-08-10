
'use client';

import React, { useEffect, useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
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
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const langExtension = language ? languageMap[language.toLowerCase()] : javascript();

  useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) return;
  
    const dom = view.dom;
  
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
  
    // Disable copy, paste, cut, select all
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['c', 'v', 'x', 'a']; // copy, paste, cut, select all
        if (blockedKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };
  
    // Disable drag & drop
    const handleDrop = (e: DragEvent) => e.preventDefault();
  
    // Disable middle-click paste
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };
  
    dom.addEventListener('contextmenu', handleContextMenu);
    dom.addEventListener('keydown', handleKeyDown);
    dom.addEventListener('drop', handleDrop);
    dom.addEventListener('mousedown', handleMouseDown);
  
    return () => {
      dom.removeEventListener('contextmenu', handleContextMenu);
      dom.removeEventListener('keydown', handleKeyDown);
      dom.removeEventListener('drop', handleDrop);
      dom.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const isClient = typeof window !== 'undefined';
  if (!isClient) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="absolute inset-0">
      <CodeMirror
        ref={editorRef}
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
