import React from 'react';

interface MathRendererProps {
  content: string;
  inline?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, inline = false }) => {
  // Simple math notation rendering without external dependencies
  const renderMath = (text: string): string => {
    return text
      // Greek letters
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\omega/g, 'ω')
      
      // Mathematical symbols
      .replace(/\\infty/g, '∞')
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\int/g, '∫')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\sqrt/g, '√')
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\approx/g, '≈')
      .replace(/\\equiv/g, '≡')
      .replace(/\\in/g, '∈')
      .replace(/\\subset/g, '⊂')
      .replace(/\\supset/g, '⊃')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      
      // Superscripts and subscripts (basic)
      .replace(/\^(\d+)/g, (match, num) => {
        const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        return num.split('').map((digit: string) => superscripts[parseInt(digit)]).join('');
      })
      .replace(/_(\d+)/g, (match, num) => {
        const subscripts = '₀₁₂₃₄₅₆₇₈₉';
        return num.split('').map((digit: string) => subscripts[parseInt(digit)]).join('');
      });
  };

  const processedContent = renderMath(content);

  if (inline) {
    return (
      <span 
        className="font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-1 py-0.5 rounded"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  }

  return (
    <div className="my-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">📐 Mathematical Expression</span>
      </div>
      <div 
        className="font-mono text-lg text-center text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

export default MathRenderer;