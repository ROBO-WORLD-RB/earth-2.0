import React, { useState } from 'react';
import { ProcessedFile } from '../services/advancedFileService';

interface EnhancedFilePreviewProps {
  file: ProcessedFile;
  onRemove?: (fileId: string) => void;
  showRemove?: boolean;
  className?: string;
}

const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({
  file,
  onRemove,
  showRemove = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📄';
    } else if (file.language) {
      const iconMap: Record<string, string> = {
        javascript: '🟨',
        typescript: '🔷',
        python: '🐍',
        java: '☕',
        cpp: '⚙️',
        html: '🌐',
        css: '🎨',
        json: '📋',
        markdown: '📝'
      };
      return iconMap[file.language] || '📄';
    }
    return '📄';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-2">
          <img
            src={file.thumbnail || `data:${file.type};base64,${file.content}`}
            alt={file.name}
            className="max-w-full h-32 object-cover rounded border"
          />
          {file.metadata?.dimensions && (
            <p className="text-xs text-gray-500 mt-1">
              {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
            </p>
          )}
        </div>
      );
    }

    if (file.type === 'application/pdf' && file.extractedText) {
      const previewText = showFullContent 
        ? file.extractedText 
        : file.extractedText.substring(0, 200) + (file.extractedText.length > 200 ? '...' : '');

      return (
        <div className="mt-2">
          {file.thumbnail && (
            <img
              src={file.thumbnail}
              alt="PDF Preview"
              className="w-16 h-20 object-cover rounded border mb-2"
            />
          )}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-xs">
            <pre className="whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
              {previewText}
            </pre>
            {file.extractedText.length > 200 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-purple-600 hover:text-purple-700 text-xs mt-1"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (file.language && file.syntaxHighlighted) {
      const previewContent = showFullContent 
        ? file.content 
        : file.content.substring(0, 300) + (file.content.length > 300 ? '...' : '');

      return (
        <div className="mt-2">
          <div className="bg-gray-900 rounded p-3 text-xs overflow-x-auto">
            <pre className="text-gray-100">
              <code className={`language-${file.language}`}>
                {previewContent}
              </code>
            </pre>
            {file.content.length > 300 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-purple-400 hover:text-purple-300 text-xs mt-2"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Default text content
    if (file.content && typeof file.content === 'string' && !file.content.startsWith('data:')) {
      const previewContent = showFullContent 
        ? file.content 
        : file.content.substring(0, 200) + (file.content.length > 200 ? '...' : '');

      return (
        <div className="mt-2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-xs">
            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {previewContent}
            </pre>
            {file.content.length > 200 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-purple-600 hover:text-purple-700 text-xs mt-1"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{getFileIcon()}</span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {file.name}
              </h4>
              {file.language && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {file.language}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatFileSize(file.size)}</span>
              {file.metadata?.pages && (
                <span>{file.metadata.pages} page{file.metadata.pages !== 1 ? 's' : ''}</span>
              )}
              {file.metadata?.wordCount && (
                <span>{file.metadata.wordCount.toLocaleString()} words</span>
              )}
              <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
            </div>

            {(file.extractedText || file.content) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-600 hover:text-purple-700 text-xs mt-2 flex items-center gap-1"
              >
                {isExpanded ? 'Hide preview' : 'Show preview'}
                <svg 
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {showRemove && onRemove && (
          <button
            onClick={() => onRemove(file.id)}
            className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && renderContent()}
    </div>
  );
};

export default EnhancedFilePreview;