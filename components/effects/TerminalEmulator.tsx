'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Command {
  input: string;
  output: string[];
}

const commands: Record<string, () => string[]> = {
  help: () => [
    'Available commands:',
    '  help     - Show this help message',
    '  about    - About me',
    '  skills   - My technical skills',
    '  projects - My projects',
    '  contact  - Contact information',
    '  social   - Social media links',
    '  clear    - Clear terminal',
    '  date     - Show current date',
    '  whoami   - Who am I?',
  ],
  about: () => [
    '┌─────────────────────────────────┐',
    '│  ADA Lab Developer              │',
    '│  Full-Stack Engineer            │',
    '│  Based in Japan                 │',
    '└─────────────────────────────────┘',
    '',
    'Building products that people love.',
    'Passionate about clean code and UX.',
  ],
  skills: () => [
    'Technical Skills:',
    '',
    '  Languages:',
    '    ● TypeScript  ████████████ 90%',
    '    ● Python      ██████████░░ 80%',
    '    ● JavaScript  ████████████ 95%',
    '',
    '  Frameworks:',
    '    ● React/Next.js',
    '    ● Node.js',
    '    ● FastAPI',
    '',
    '  Tools:',
    '    ● Git, Docker, AWS',
  ],
  projects: () => [
    'Projects:',
    '',
    '  [1] Rem Bot',
    '      Discord reminder bot',
    '      Tech: Python, Discord.py',
    '',
    '  [2] Navi',
    '      Navigation assistant',
    '      Tech: TypeScript, React',
    '',
    'Visit /projects for more details.',
  ],
  contact: () => [
    'Contact:',
    '',
    '  Email: info.adalabtech@gmail.com',
    '  GitHub: github.com/adabana-saki',
    '  X: @ADA_Lab_tech',
  ],
  social: () => [
    'Social Links:',
    '',
    '  GitHub  → github.com/adabana-saki',
    '  X       → x.com/ADA_Lab_tech',
    '  Discord → discord.gg/7Egm8uJPDs',
    '  Qiita   → qiita.com/adabana-saki',
  ],
  date: () => [
    new Date().toLocaleString('ja-JP', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  ],
  whoami: () => ['adabana-saki'],
  echo: () => ['Usage: echo <message>'],
  pwd: () => ['/home/adabana-saki/projects/adalab'],
  ls: () => [
    'README.md  package.json  src/  public/  node_modules/',
  ],
};

export function TerminalEmulator() {
  const [history, setHistory] = useState<Command[]>([
    {
      input: '',
      output: [
        '╔════════════════════════════════════════╗',
        '║  ADA Lab Terminal v1.0.0               ║',
        '║  Type "help" for available commands    ║',
        '╚════════════════════════════════════════╝',
        '',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim().toLowerCase();

    if (!trimmedInput) return;

    let output: string[];

    if (trimmedInput === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (trimmedInput.startsWith('echo ')) {
      output = [trimmedInput.slice(5)];
    } else if (commands[trimmedInput]) {
      output = commands[trimmedInput]();
    } else {
      output = [`Command not found: ${trimmedInput}`, 'Type "help" for available commands.'];
    }

    setHistory((prev) => [...prev, { input: trimmedInput, output }]);
    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="bg-black/90 rounded-xl border border-neon-cyan/30 overflow-hidden cursor-text h-full flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-neon-cyan/20 bg-black/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-2">terminal</span>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="h-64 overflow-y-auto p-4 font-mono text-sm"
      >
        {history.map((cmd, i) => (
          <div key={i} className="mb-2">
            {cmd.input && (
              <div className="flex items-center gap-2 text-neon-cyan">
                <span className="text-neon-purple">❯</span>
                <span>{cmd.input}</span>
              </div>
            )}
            {cmd.output.map((line, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: j * 0.02 }}
                className="text-gray-300 whitespace-pre"
              >
                {line}
              </motion.div>
            ))}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-neon-purple">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-neon-cyan outline-none caret-neon-cyan"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
