import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';

interface EnhancedCodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

// Language-specific syntax highlighting patterns
const syntaxPatterns = {
  javascript: [
    { pattern: /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default)\b/g, className: 'text-purple-400' },
    { pattern: /\b(true|false|null|undefined)\b/g, className: 'text-orange-400' },
    { pattern: /\b\d+\b/g, className: 'text-green-400' },
    { pattern: /"[^"]*"|'[^']*'|`[^`]*`/g, className: 'text-yellow-300' },
    { pattern: /\/\/.*$/gm, className: 'text-gray-500 italic' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
  ],
  python: [
    { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield)\b/g, className: 'text-purple-400' },
    { pattern: /\b(True|False|None)\b/g, className: 'text-orange-400' },
    { pattern: /\b\d+\b/g, className: 'text-green-400' },
    { pattern: /"[^"]*"|'[^']*'|"""[\s\S]*?"""|'''[\s\S]*?'''/g, className: 'text-yellow-300' },
    { pattern: /#.*$/gm, className: 'text-gray-500 italic' },
  ],
  java: [
    { pattern: /\b(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|import|package|new|this|super)\b/g, className: 'text-purple-400' },
    { pattern: /\b(true|false|null)\b/g, className: 'text-orange-400' },
    { pattern: /\b\d+\b/g, className: 'text-green-400' },
    { pattern: /"[^"]*"/g, className: 'text-yellow-300' },
    { pattern: /\/\/.*$/gm, className: 'text-gray-500 italic' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
  ],
  html: [
    { pattern: /&lt;[^&gt;]*&gt;/g, className: 'text-blue-400' },
    { pattern: /\b(class|id|src|href|alt|title)=/g, className: 'text-green-400' },
    { pattern: /"[^"]*"/g, className: 'text-yellow-300' },
    { pattern: /&lt;!--[\s\S]*?--&gt;/g, className: 'text-gray-500 italic' },
  ],
  css: [
    { pattern: /\.[a-zA-Z-]+|#[a-zA-Z-]+/g, className: 'text-green-400' },
    { pattern: /\b(color|background|margin|padding|border|width|height|display|position|font-size|font-weight)\b/g, className: 'text-blue-400' },
    { pattern: /"[^"]*"|'[^']*'/g, className: 'text-yellow-300' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
  ]
};

const detectLanguage = (className?: string): string => {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1].toLowerCase() : 'text';
};

const applySyntaxHighlighting = (code: string, language: string): string => {
  const patterns = syntaxPatterns[language as keyof typeof syntaxPatterns];
  if (!patterns) return code;

  let highlightedCode = code;
  
  patterns.forEach(({ pattern, className }) => {
    highlightedCode = highlightedCode.replace(pattern, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
  });

  return highlightedCode;
};

const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({ 
  children, 
  className, 
  inline = false 
}) => {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(className);
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (inline) {
    return (
      <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-md px-2 py-1 font-mono text-sm font-medium">
        {children}
      </code>
    );
  }

  const highlightedCode = applySyntaxHighlighting(code, language);

  return (
    <div className="relative group my-6">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-gray-300 px-4 py-2 text-sm rounded-t-lg border-b border-gray-700">
        <span className="font-medium capitalize">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          title="Copy code"
        >
          <CopyIcon className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {/* Code content */}
      <pre className="bg-gray-900 dark:bg-gray-950 rounded-b-lg p-4 overflow-x-auto border border-gray-700">
        <code 
          className="font-mono text-sm text-gray-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default EnhancedCodeBlock;