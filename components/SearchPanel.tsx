import React, { useState, useEffect, useRef } from 'react';
import { Conversation } from '../types';
import { searchService, SearchResult, SearchFilters } from '../services/searchService';

interface SearchPanelProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string, messageIndex?: number) => void;
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  conversations,
  onSelectConversation,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    messageType: 'all',
    hasFiles: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input when panel opens
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Build search index
    searchService.buildSearchIndex(conversations);
  }, [conversations]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = searchService.search(query, conversations, filters, 20);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, conversations, filters]);

  const handleResultClick = (result: SearchResult) => {
    onSelectConversation(result.conversationId, result.messageIndex);
    onClose();
  };

  const highlightText = (text: string, highlights: { start: number; end: number }[]) => {
    if (!highlights.length) return text;

    const parts = [];
    let lastIndex = 0;

    highlights.forEach(({ start, end }) => {
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      parts.push(
        <mark key={`${start}-${end}`} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {text.substring(start, end)}
        </mark>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-10 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Search filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message Type
                </label>
                <select
                  value={filters.messageType || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value as any }))}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Messages</option>
                  <option value="user">My Messages</option>
                  <option value="model">AI Responses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Files
                </label>
                <select
                  value={filters.hasFiles === undefined ? 'all' : filters.hasFiles ? 'yes' : 'no'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters(prev => ({ 
                      ...prev, 
                      hasFiles: value === 'all' ? undefined : value === 'yes' 
                    }));
                  }}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="yes">With Files</option>
                  <option value="no">No Files</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ messageType: 'all', hasFiles: undefined })}
                className="self-end px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or check your filters</p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((result, index) => (
                <button
                  key={`${result.conversationId}-${result.messageIndex}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.conversationTitle}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.message.role === 'user'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                        }`}>
                          {result.message.role === 'user' ? 'You' : 'AI'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {highlightText(result.snippet, result.highlights)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Score: {result.score}</span>
                      {result.message.files && result.message.files.length > 0 && (
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : !query ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Search your conversations</p>
              <p className="text-sm mt-1">Enter keywords to find messages across all chats</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;