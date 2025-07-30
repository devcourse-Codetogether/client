import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  theme?: 'light' | 'dark';
}

export default function MonacoEditor({ theme = 'light' }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value: `function hello() {\n  console.log("Hello, world!");\n}`,
      language: 'typescript',
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
    });

    return () => editor.dispose();
  }, [theme]);

  return <div ref={editorRef} className="w-full h-full" />;
}
