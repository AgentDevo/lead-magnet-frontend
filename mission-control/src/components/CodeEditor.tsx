import React, { useEffect, useState } from 'react';
import { MonacoEditor } from '@monaco-editor/react';
import toast from 'react-hot-toast';

/**
 * Simple code editor component using Monaco.
 * Props:
 *   filePath – absolute path on the OpenClaw host to load/save.
 *   language – monaco language identifier (e.g., 'bash', 'javascript').
 */
export default function CodeEditor({ filePath, language = 'bash' }: { filePath: string; language?: string }) {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load file content on mount via a tiny API endpoint (we'll create it).
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
        if (!res.ok) throw new Error('Failed to load file');
        const data = await res.text();
        setCode(data);
        setLoading(false);
      } catch (e) {
        toast.error(`Error loading ${filePath}`);
        setLoading(false);
      }
    };
    load();
  }, [filePath]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: code }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('File saved');
    } catch (e) {
      toast.error('Save error');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="p-4 text-gray-400">Loading…</div>
      ) : (
        <MonacoEditor
          height="calc(100vh - 120px)"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          options={{ automaticLayout: true }}
        />
      )}
      <div className="p-2 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
