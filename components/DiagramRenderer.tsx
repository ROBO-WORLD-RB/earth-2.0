import React from 'react';

interface DiagramRendererProps {
  content: string;
  type?: 'ascii' | 'flowchart' | 'sequence' | 'table';
}

const DiagramRenderer: React.FC<DiagramRendererProps> = ({ content, type = 'ascii' }) => {
  // Detect if content looks like ASCII art or diagrams
  const isAsciiArt = (text: string): boolean => {
    const asciiChars = /[│┌┐└┘├┤┬┴┼─━┃┏┓┗┛┣┫┳┻╋═║╔╗╚╝╠╣╦╩╬▲▼◄►→←↑↓]/;
    const boxChars = /[+\-|\/\\]/;
    const lines = text.split('\n');
    
    return lines.length > 2 && (
      asciiChars.test(text) || 
      (boxChars.test(text) && lines.some(line => line.length > 10))
    );
  };

  // Detect flowchart-like content
  const isFlowchart = (text: string): boolean => {
    const flowchartKeywords = /\b(start|end|if|then|else|while|for|process|decision|input|output)\b/i;
    const arrows = /[-=]+>|<[-=]+|→|←|↑|↓/;
    return flowchartKeywords.test(text) || arrows.test(text);
  };

  // Enhanced ASCII art rendering
  const renderAsciiArt = (text: string) => {
    return (
      <div className="my-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">📊 Diagram</span>
        </div>
        <pre className="font-mono text-sm leading-tight text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
          {text}
        </pre>
      </div>
    );
  };

  // Enhanced table rendering
  const renderTable = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return <pre className="font-mono">{text}</pre>;

    // Simple table detection and parsing
    const isTableRow = (line: string) => line.includes('|') && line.split('|').length > 2;
    
    if (!lines.some(isTableRow)) {
      return <pre className="font-mono">{text}</pre>;
    }

    const tableRows = lines.filter(isTableRow);
    const headers = tableRows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const rows = tableRows.slice(1).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Process content based on type or auto-detection
  if (type === 'table' || content.includes('|') && content.split('\n').length > 2) {
    return renderTable(content);
  }

  if (type === 'ascii' || isAsciiArt(content)) {
    return renderAsciiArt(content);
  }

  if (isFlowchart(content)) {
    return (
      <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">🔄 Flowchart</span>
        </div>
        <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  // Default rendering for regular code blocks
  return (
    <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 my-6 overflow-x-auto border border-gray-700">
      <code className="font-mono text-sm text-gray-100 leading-relaxed">
        {content}
      </code>
    </pre>
  );
};

export default DiagramRenderer;