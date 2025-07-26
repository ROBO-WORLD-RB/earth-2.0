// Personality Service for managing saved AI personalities and user preferences

import { useState, useEffect } from 'react';
import { PersonalityTemplate } from '../data/personalityTemplates';

export interface SavedPersonality {
  id: string;
  name: string;
  instruction: string;
  description?: string;
  avatar?: string;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
  favorite: boolean;
  category?: string;
  icon?: string;
  tags: string[];
}

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  defaultPersonalityId?: string;
  lastUsedPersonalityId?: string;
  favoritePersonalityIds?: string[];
  recentPersonalityIds?: string[];
}

class PersonalityService {
  private readonly STORAGE_KEY = 'earth-saved-personalities';
  private readonly PREFERENCES_KEY = 'earth-user-preferences';
  
  // Get all saved personalities
  public getSavedPersonalities(): SavedPersonality[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved personalities:', error);
      return [];
    }
  }
  
  // Save a new personality
  public savePersonality(personality: Omit<SavedPersonality, 'id' | 'createdAt'>): SavedPersonality {
    try {
      const personalities = this.getSavedPersonalities();
      
      // Create new personality with ID and timestamp
      const newPersonality: SavedPersonality = {
        ...personality,
        id: `personality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        useCount: 0,
        favorite: personality.favorite || false,
        tags: personality.tags || [],
      };
      
      // Add to list and save
      personalities.push(newPersonality);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(personalities));
      
      return newPersonality;
    } catch (error) {
      console.error('Error saving personality:', error);
      throw error;
    }
  }
  
  // Update an existing personality
  public updatePersonality(id: string, updates: Partial<SavedPersonality>): SavedPersonality | null {
    try {
      const personalities = this.getSavedPersonalities();
      const index = personalities.findIndex(p => p.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Update the personality
      personalities[index] = {
        ...personalities[index],
        ...updates,
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(personalities));
      return personalities[index];
    } catch (error) {
      console.error('Error updating personality:', error);
      return null;
    }
  }
  
  // Delete a personality
  public deletePersonality(id: string): boolean {
    try {
      const personalities = this.getSavedPersonalities();
      const filtered = personalities.filter(p => p.id !== id);
      
      if (filtered.length === personalities.length) {
        return false; // Nothing was deleted
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting personality:', error);
      return false;
    }
  }
  
  // Mark a personality as used (updates lastUsed timestamp)
  public markPersonalityAsUsed(id: string): void {
    this.updatePersonality(id, { lastUsed: Date.now() });
  }

  // Use personality (alias for markPersonalityAsUsed for consistency with PersonalityManager)
  public usePersonality(id: string): void {
    const personality = this.getSavedPersonalities().find(p => p.id === id);
    if (personality) {
      this.updatePersonality(id, { 
        lastUsed: Date.now(),
        useCount: (personality.useCount || 0) + 1
      });
    }
  }
  
  // Toggle favorite status
  public toggleFavorite(id: string): boolean {
    try {
      const personalities = this.getSavedPersonalities();
      const personality = personalities.find(p => p.id === id);
      
      if (!personality) {
        return false;
      }
      
      const isFavorite = !personality.favorite;
      this.updatePersonality(id, { favorite: isFavorite });
      return isFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }
  
  // Get recently used personalities
  public getRecentPersonalities(limit: number = 5): SavedPersonality[] {
    const personalities = this.getSavedPersonalities();
    return personalities
      .filter(p => p.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  }
  
  // Get favorite personalities
  public getFavoritePersonalities(): SavedPersonality[] {
    const personalities = this.getSavedPersonalities();
    return personalities.filter(p => p.favorite);
  }

  // Get user preferences
  public getUserPreferences(): UserPreferences {
    try {
      const preferences = localStorage.getItem(this.PREFERENCES_KEY);
      if (preferences) {
        return JSON.parse(preferences);
      }
      // Return default preferences if none exist
      const defaultPreferences: UserPreferences = {
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      };
      // Save default preferences
      this.setUserPreferences(defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Return default preferences on error
      return {
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      };
    }
  }

  // Set user preferences
  public setUserPreferences(prefs: Partial<UserPreferences>): boolean {
    try {
      // Get current preferences and merge with new ones
      const currentPrefs = this.getUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...prefs };
      
      // Save to local storage
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updatedPrefs));
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }
  
  // Mark onboarding as complete
  public markOnboardingComplete(): boolean {
    return this.setUserPreferences({ hasCompletedOnboarding: true });
  }
  
  // Add a template to recently used
  public addToRecentTemplates(templateId: string): boolean {
    try {
      const prefs = this.getUserPreferences();
      const recentIds = prefs.recentPersonalityIds || [];
      
      // Remove if already exists (to move it to the front)
      const filteredIds = recentIds.filter(id => id !== templateId);
      
      // Add to the beginning of the array
      filteredIds.unshift(templateId);
      
      // Keep only the most recent 10
      const updatedRecentIds = filteredIds.slice(0, 10);
      
      return this.setUserPreferences({ 
        recentPersonalityIds: updatedRecentIds,
        lastUsedPersonalityId: templateId 
      });
    } catch (error) {
      console.error('Error updating recent templates:', error);
      return false;
    }
  }
  
  // Toggle a template as favorite
  public toggleTemplateFavorite(templateId: string): boolean {
    try {
      const prefs = this.getUserPreferences();
      const favoriteIds = prefs.favoritePersonalityIds || [];
      
      let updatedFavoriteIds: string[];
      
      if (favoriteIds.includes(templateId)) {
        // Remove from favorites
        updatedFavoriteIds = favoriteIds.filter(id => id !== templateId);
      } else {
        // Add to favorites
        updatedFavoriteIds = [...favoriteIds, templateId];
      }
      
      return this.setUserPreferences({ favoritePersonalityIds: updatedFavoriteIds });
    } catch (error) {
      console.error('Error toggling template favorite:', error);
      return false;
    }
  }
  
  // Check if a template is a favorite
  public isTemplateFavorite(templateId: string): boolean {
    try {
      const prefs = this.getUserPreferences();
      const favoriteIds = prefs.favoritePersonalityIds || [];
      return favoriteIds.includes(templateId);
    } catch (error) {
      console.error('Error checking if template is favorite:', error);
      return false;
    }
  }
  
  // Get featured templates
  public getFeaturedTemplates(templates: PersonalityTemplate[], limit: number = 6): PersonalityTemplate[] {
    try {
      // First, get explicitly featured templates
      const featuredTemplates = templates.filter(template => template.featured);
      
      // If we have enough featured templates, return them
      if (featuredTemplates.length >= limit) {
        return featuredTemplates.slice(0, limit);
      }
      
      // Otherwise, supplement with popular templates
      const remainingCount = limit - featuredTemplates.length;
      const popularTemplates = templates
        .filter(template => !template.featured) // Exclude already featured templates
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, remainingCount);
      
      return [...featuredTemplates, ...popularTemplates];
    } catch (error) {
      console.error('Error getting featured templates:', error);
      return [];
    }
  }
  
  // Get recent templates
  public getRecentTemplates(templates: PersonalityTemplate[], limit: number = 5): PersonalityTemplate[] {
    try {
      const prefs = this.getUserPreferences();
      const recentIds = prefs.recentPersonalityIds || [];
      
      // Filter templates to only include those in the recent list
      // and preserve the order from the recentIds array
      const recentTemplates = recentIds
        .map(id => templates.find(template => template.id === id))
        .filter((template): template is PersonalityTemplate => template !== undefined)
        .slice(0, limit);
      
      return recentTemplates;
    } catch (error) {
      console.error('Error getting recent templates:', error);
      return [];
    }
  }
  
  // Get favorite templates
  public getFavoriteTemplates(templates: PersonalityTemplate[]): PersonalityTemplate[] {
    try {
      const prefs = this.getUserPreferences();
      const favoriteIds = prefs.favoritePersonalityIds || [];
      
      // Filter templates to only include those in the favorites list
      return templates.filter(template => favoriteIds.includes(template.id));
    } catch (error) {
      console.error('Error getting favorite templates:', error);
      return [];
    }
  }
}

// Create singleton instance
export const personalityService = new PersonalityService();

// React hook for personality management
export const usePersonalities = () => {
  const [savedPersonalities, setSavedPersonalities] = useState<SavedPersonality[]>([]);
  const [recentPersonalities, setRecentPersonalities] = useState<SavedPersonality[]>([]);
  const [favoritePersonalities, setFavoritePersonalities] = useState<SavedPersonality[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    personalityService.getUserPreferences()
  );
  
  // Load personalities on mount
  useEffect(() => {
    refreshPersonalities();
    refreshUserPreferences();
  }, []);
  
  // Refresh all personality lists
  const refreshPersonalities = () => {
    setSavedPersonalities(personalityService.getSavedPersonalities());
    setRecentPersonalities(personalityService.getRecentPersonalities());
    setFavoritePersonalities(personalityService.getFavoritePersonalities());
  };
  
  // Refresh user preferences
  const refreshUserPreferences = () => {
    setUserPreferences(personalityService.getUserPreferences());
  };
  
  // Save a new personality
  const savePersonality = (personality: Omit<SavedPersonality, 'id' | 'createdAt'>) => {
    const result = personalityService.savePersonality(personality);
    refreshPersonalities();
    return result;
  };
  
  // Update an existing personality
  const updatePersonality = (id: string, updates: Partial<SavedPersonality>) => {
    const result = personalityService.updatePersonality(id, updates);
    refreshPersonalities();
    return result;
  };
  
  // Delete a personality
  const deletePersonality = (id: string) => {
    const result = personalityService.deletePersonality(id);
    refreshPersonalities();
    return result;
  };
  
  // Mark a personality as used
  const usePersonality = (id: string) => {
    personalityService.markPersonalityAsUsed(id);
    refreshPersonalities();
  };
  
  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    const result = personalityService.toggleFavorite(id);
    refreshPersonalities();
    return result;
  };
  
  // Update user preferences
  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    const result = personalityService.setUserPreferences(prefs);
    if (result) {
      refreshUserPreferences();
    }
    return result;
  };
  
  // Mark onboarding as complete
  const markOnboardingComplete = () => {
    const result = personalityService.markOnboardingComplete();
    if (result) {
      refreshUserPreferences();
    }
    return result;
  };
  
  // Add template to recently used
  const addToRecentTemplates = (templateId: string) => {
    const result = personalityService.addToRecentTemplates(templateId);
    if (result) {
      refreshUserPreferences();
    }
    return result;
  };
  
  // Toggle template favorite
  const toggleTemplateFavorite = (templateId: string) => {
    const result = personalityService.toggleTemplateFavorite(templateId);
    if (result) {
      refreshUserPreferences();
    }
    return result;
  };
  
  // Check if template is favorite
  const isTemplateFavorite = (templateId: string) => {
    return personalityService.isTemplateFavorite(templateId);
  };

  return {
    savedPersonalities,
    recentPersonalities,
    favoritePersonalities,
    userPreferences,
    savePersonality,
    updatePersonality,
    deletePersonality,
    usePersonality,
    toggleFavorite,
    refreshPersonalities,
    updateUserPreferences,
    markOnboardingComplete,
    addToRecentTemplates,
    toggleTemplateFavorite,
    isTemplateFavorite
  };
};

export default personalityService;