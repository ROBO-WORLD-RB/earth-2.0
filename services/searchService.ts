// Search Service for conversation search and organization
// Provides full-text search, tagging, and organization features

import { Conversation, Message } from '../types';

export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageIndex: number;
  message: Message;
  snippet: string;
  highlights: { start: number; end: number }[];
  score: number;
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageType?: 'user' | 'model' | 'all';
  hasFiles?: boolean;
  tags?: string[];
}

export interface ConversationTag {
  id: string;
  name: string;
  color: string;
  conversationIds: string[];
  createdAt: number;
}

export interface SearchIndex {
  conversationId: string;
  messageIndex: number;
  content: string;
  role: 'user' | 'model';
  timestamp: number;
  hasFiles: boolean;
  tags: string[];
}

class SearchService {
  private searchIndex: SearchIndex[] = [];
  private tags: ConversationTag[] = [];
  private readonly TAGS_KEY = 'earth-conversation-tags';
  private readonly INDEX_KEY = 'earth-search-index';

  constructor() {
    this.loadTags();
    this.loadSearchIndex();
  }

  // Index Management
  public buildSearchIndex(conversations: Conversation[]): void {
    this.searchIndex = [];
    
    conversations.forEach(conversation => {
      conversation.messages.forEach((message, messageIndex) => {
        this.searchIndex.push({
          conversationId: conversation.id,
          messageIndex,
          content: message.content.toLowerCase(),
          role: message.role,
          timestamp: Date.now(), // In real app, this would come from message timestamp
          hasFiles: !!(message.files && message.files.length > 0),
          tags: this.getConversationTags(conversation.id)
        });
      });
    });
    
    this.saveSearchIndex();
  }

  public updateConversationInIndex(conversation: Conversation): void {
    // Remove existing entries for this conversation
    this.searchIndex = this.searchIndex.filter(
      entry => entry.conversationId !== conversation.id
    );
    
    // Add updated entries
    conversation.messages.forEach((message, messageIndex) => {
      this.searchIndex.push({
        conversationId: conversation.id,
        messageIndex,
        content: message.content.toLowerCase(),
        role: message.role,
        timestamp: Date.now(),
        hasFiles: !!(message.files && message.files.length > 0),
        tags: this.getConversationTags(conversation.id)
      });
    });
    
    this.saveSearchIndex();
  }

  public removeConversationFromIndex(conversationId: string): void {
    this.searchIndex = this.searchIndex.filter(
      entry => entry.conversationId !== conversationId
    );
    this.saveSearchIndex();
  }

  // Search Methods
  public search(
    query: string, 
    conversations: Conversation[], 
    filters?: SearchFilters,
    limit: number = 50
  ): SearchResult[] {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    const results: SearchResult[] = [];

    this.searchIndex.forEach(indexEntry => {
      const conversation = conversations.find(c => c.id === indexEntry.conversationId);
      if (!conversation) return;

      const message = conversation.messages[indexEntry.messageIndex];
      if (!message) return;

      // Apply filters
      if (filters) {
        if (filters.messageType && filters.messageType !== 'all' && message.role !== filters.messageType) {
          return;
        }
        
        if (filters.hasFiles !== undefined && indexEntry.hasFiles !== filters.hasFiles) {
          return;
        }
        
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some(tag => indexEntry.tags.includes(tag));
          if (!hasMatchingTag) return;
        }
        
        if (filters.dateRange) {
          // In a real app, you'd check message timestamp against date range
          // For now, we'll skip this filter
        }
      }

      // Calculate relevance score
      let score = 0;
      const highlights: { start: number; end: number }[] = [];
      const content = message.content.toLowerCase();

      searchTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        const matches = Array.from(content.matchAll(regex));
        
        matches.forEach(match => {
          score += 1;
          if (match.index !== undefined) {
            highlights.push({
              start: match.index,
              end: match.index + term.length
            });
          }
        });

        // Boost score for exact phrase matches
        if (content.includes(query.toLowerCase())) {
          score += 2;
        }

        // Boost score for title matches
        if (conversation.title.toLowerCase().includes(term)) {
          score += 3;
        }
      });

      if (score > 0) {
        // Create snippet with highlights
        const snippet = this.createSnippet(message.content, highlights, 150);
        
        results.push({
          conversationId: conversation.id,
          conversationTitle: conversation.title,
          messageIndex: indexEntry.messageIndex,
          message,
          snippet,
          highlights,
          score
        });
      }
    });

    // Sort by relevance score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private createSnippet(content: string, highlights: { start: number; end: number }[], maxLength: number): string {
    if (content.length <= maxLength) return content;

    // Find the best position to center the snippet around highlights
    let bestStart = 0;
    if (highlights.length > 0) {
      const firstHighlight = highlights[0];
      bestStart = Math.max(0, firstHighlight.start - Math.floor(maxLength / 2));
    }

    let snippet = content.substring(bestStart, bestStart + maxLength);
    
    // Add ellipsis if needed
    if (bestStart > 0) snippet = '...' + snippet;
    if (bestStart + maxLength < content.length) snippet = snippet + '...';

    return snippet;
  }

  // Auto-tagging using simple keyword analysis
  public generateAutoTags(conversation: Conversation): string[] {
    const content = conversation.messages
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    const tags: string[] = [];

    // Programming-related tags
    if (/\b(code|programming|javascript|python|react|html|css|function|variable|array|object)\b/.test(content)) {
      tags.push('programming');
    }

    // Writing-related tags
    if (/\b(write|writing|essay|article|story|blog|content|draft)\b/.test(content)) {
      tags.push('writing');
    }

    // Learning-related tags
    if (/\b(learn|learning|explain|understand|tutorial|guide|how to)\b/.test(content)) {
      tags.push('learning');
    }

    // Creative tags
    if (/\b(creative|idea|brainstorm|design|art|music|poem|story)\b/.test(content)) {
      tags.push('creative');
    }

    // Business tags
    if (/\b(business|marketing|strategy|plan|meeting|project|client)\b/.test(content)) {
      tags.push('business');
    }

    // Technical tags
    if (/\b(technical|api|database|server|deployment|bug|error|debug)\b/.test(content)) {
      tags.push('technical');
    }

    // Question tags
    if (/\?/.test(content) || /\b(what|how|why|when|where|who)\b/.test(content)) {
      tags.push('questions');
    }

    return tags;
  }

  // Tag Management
  public getTags(): ConversationTag[] {
    return [...this.tags];
  }

  public createTag(name: string, color: string): ConversationTag {
    const tag: ConversationTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color,
      conversationIds: [],
      createdAt: Date.now()
    };

    this.tags.push(tag);
    this.saveTags();
    return tag;
  }

  public deleteTag(tagId: string): boolean {
    const index = this.tags.findIndex(tag => tag.id === tagId);
    if (index === -1) return false;

    this.tags.splice(index, 1);
    this.saveTags();
    return true;
  }

  public addTagToConversation(tagId: string, conversationId: string): boolean {
    const tag = this.tags.find(t => t.id === tagId);
    if (!tag) return false;

    if (!tag.conversationIds.includes(conversationId)) {
      tag.conversationIds.push(conversationId);
      this.saveTags();
    }
    return true;
  }

  public removeTagFromConversation(tagId: string, conversationId: string): boolean {
    const tag = this.tags.find(t => t.id === tagId);
    if (!tag) return false;

    const index = tag.conversationIds.indexOf(conversationId);
    if (index !== -1) {
      tag.conversationIds.splice(index, 1);
      this.saveTags();
    }
    return true;
  }

  public getConversationTags(conversationId: string): string[] {
    return this.tags
      .filter(tag => tag.conversationIds.includes(conversationId))
      .map(tag => tag.name);
  }

  public getTagsByConversation(conversationId: string): ConversationTag[] {
    return this.tags.filter(tag => tag.conversationIds.includes(conversationId));
  }

  // Organization Methods
  public getConversationsByTag(tagName: string, conversations: Conversation[]): Conversation[] {
    const tag = this.tags.find(t => t.name === tagName);
    if (!tag) return [];

    return conversations.filter(conv => tag.conversationIds.includes(conv.id));
  }

  public getFavoriteConversations(conversations: Conversation[]): Conversation[] {
    try {
      const favorites = JSON.parse(localStorage.getItem('earth-favorite-conversations') || '[]');
      return conversations.filter(conv => favorites.includes(conv.id));
    } catch {
      return [];
    }
  }

  public toggleFavoriteConversation(conversationId: string): boolean {
    try {
      const favorites = JSON.parse(localStorage.getItem('earth-favorite-conversations') || '[]');
      const index = favorites.indexOf(conversationId);
      
      if (index === -1) {
        favorites.push(conversationId);
      } else {
        favorites.splice(index, 1);
      }
      
      localStorage.setItem('earth-favorite-conversations', JSON.stringify(favorites));
      return index === -1; // Return true if added to favorites
    } catch {
      return false;
    }
  }

  public isConversationFavorite(conversationId: string): boolean {
    try {
      const favorites = JSON.parse(localStorage.getItem('earth-favorite-conversations') || '[]');
      return favorites.includes(conversationId);
    } catch {
      return false;
    }
  }

  // Persistence
  private saveTags(): void {
    try {
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.tags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  }

  private loadTags(): void {
    try {
      const saved = localStorage.getItem(this.TAGS_KEY);
      if (saved) {
        this.tags = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      this.tags = [];
    }
  }

  private saveSearchIndex(): void {
    try {
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(this.searchIndex));
    } catch (error) {
      console.error('Error saving search index:', error);
    }
  }

  private loadSearchIndex(): void {
    try {
      const saved = localStorage.getItem(this.INDEX_KEY);
      if (saved) {
        this.searchIndex = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading search index:', error);
      this.searchIndex = [];
    }
  }
}

// Create singleton instance
export const searchService = new SearchService();
export default searchService;