'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';

const defaultCode = `// Try editing this code!
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
console.log(2 + 2);
console.log([1, 2, 3].map(x => x * 2));`;

export function CodeSandbox() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);

    const logs: string[] = [];
    const originalConsoleLog = console.log;

    // Override console.log to capture output
    console.log = (...args) => {
      logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    try {
      // Create a safe eval environment
      const result = new Function(code)();
      if (result !== undefined) {
        logs.push(`→ ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
      }
    } catch (error) {
      logs.push(`Error: ${(error as Error).message}`);
    } finally {
      console.log = originalConsoleLog;
      setOutput(logs);
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(defaultCode);
    setOutput([]);
  };

  const copyCode = async () => {
    try {
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently ignore clipboard errors
    }
  };

  return (
    <div className="relative">
      {/* Editor */}
      <div className="bg-black/80 rounded-xl border border-neon-purple/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neon-purple/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">sandbox.js</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-muted-foreground" />
              )}
            </button>
            <button
              onClick={resetCode}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Reset code"
            >
              <RotateCcw size={14} className="text-muted-foreground" />
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/50 rounded text-xs font-mono text-neon-purple transition-colors disabled:opacity-50"
            >
              <Play size={12} />
              Run
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 p-4 bg-transparent text-sm font-mono text-green-400 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        {output.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-neon-purple/20"
          >
            <div className="px-4 py-2 text-xs font-mono text-muted-foreground border-b border-neon-purple/10">
              Output
            </div>
            <div className="p-4 max-h-32 overflow-y-auto">
              {output.map((line, i) => (
                <div key={i} className="text-sm font-mono text-neon-cyan">
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
