'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  language?: string;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const handleIllegalAction = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  return (
    <Textarea
      value={value}
      onChange={onChange}
      onCopy={handleIllegalAction}
      onPaste={handleIllegalAction}
      onCut={handleIllegalAction}
      placeholder="Write your code here..."
      className={cn(
        'min-h-[400px] flex-1 resize-none rounded-lg border bg-muted/20 p-4 font-mono text-sm',
        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2'
      )}
      spellCheck="false"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
    />
  );
}
