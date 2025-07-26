import { personalityService, UserPreferences } from './personalityService';
import { personalityTemplates } from '../data/personalityTemplates';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PersonalityService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('User Preferences', () => {
    test('getUserPreferences returns default preferences when none exist', () => {
      const preferences = personalityService.getUserPreferences();
      
      expect(preferences).toEqual({
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('earth-user-preferences');
    });

    test('getUserPreferences returns stored preferences', () => {
      const mockPreferences: UserPreferences = {
        hasCompletedOnboarding: true,
        defaultPersonalityId: 'test-id',
        lastUsedPersonalityId: 'test-id',
        favoritePersonalityIds: ['test-id'],
        recentPersonalityIds: ['test-id']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockPreferences));
      
      const preferences = personalityService.getUserPreferences();
      
      expect(preferences).toEqual(mockPreferences);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('earth-user-preferences');
    });

    test('setUserPreferences updates preferences correctly', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const updatePrefs = {
        hasCompletedOnboarding: true,
        lastUsedPersonalityId: 'test-id'
      };
      
      const result = personalityService.setUserPreferences(updatePrefs);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        JSON.stringify({
          ...initialPrefs,
          ...updatePrefs
        })
      );
    });

    test('markOnboardingComplete sets hasCompletedOnboarding to true', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.markOnboardingComplete();
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        JSON.stringify({
          ...initialPrefs,
          hasCompletedOnboarding: true
        })
      );
    });

    test('handles localStorage errors gracefully', () => {
      // Simulate localStorage error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const preferences = personalityService.getUserPreferences();
      
      expect(preferences).toEqual({
        hasCompletedOnboarding: false,
        favoritePersonalityIds: [],
        recentPersonalityIds: []
      });
    });
  });

  describe('Template Management', () => {
    test('addToRecentTemplates adds template to recent list', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        recentPersonalityIds: ['template-2', 'template-3']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.addToRecentTemplates('template-1');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        expect.stringContaining('"recentPersonalityIds":["template-1","template-2","template-3"]')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        expect.stringContaining('"lastUsedPersonalityId":"template-1"')
      );
    });

    test('addToRecentTemplates moves existing template to front of list', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        recentPersonalityIds: ['template-1', 'template-2', 'template-3']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.addToRecentTemplates('template-2');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        expect.stringContaining('"recentPersonalityIds":["template-2","template-1","template-3"]')
      );
    });

    test('addToRecentTemplates limits list to 10 items', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        recentPersonalityIds: [
          'template-1', 'template-2', 'template-3', 'template-4', 'template-5',
          'template-6', 'template-7', 'template-8', 'template-9', 'template-10'
        ]
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.addToRecentTemplates('template-new');
      
      expect(result).toBe(true);
      
      // Check that we have 10 items with template-new at the front and template-10 removed
      const setItemCall = localStorageMock.setItem.mock.calls[0][1];
      const savedPrefs = JSON.parse(setItemCall);
      expect(savedPrefs.recentPersonalityIds.length).toBe(10);
      expect(savedPrefs.recentPersonalityIds[0]).toBe('template-new');
      expect(savedPrefs.recentPersonalityIds).not.toContain('template-10');
    });

    test('toggleTemplateFavorite adds template to favorites', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        favoritePersonalityIds: ['template-1', 'template-2']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.toggleTemplateFavorite('template-3');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        expect.stringContaining('"favoritePersonalityIds":["template-1","template-2","template-3"]')
      );
    });

    test('toggleTemplateFavorite removes template from favorites', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        favoritePersonalityIds: ['template-1', 'template-2', 'template-3']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const result = personalityService.toggleTemplateFavorite('template-2');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'earth-user-preferences',
        expect.stringContaining('"favoritePersonalityIds":["template-1","template-3"]')
      );
    });

    test('isTemplateFavorite returns correct status', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        favoritePersonalityIds: ['template-1', 'template-2']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      expect(personalityService.isTemplateFavorite('template-1')).toBe(true);
      expect(personalityService.isTemplateFavorite('template-3')).toBe(false);
    });
  });

  describe('Template Filtering and Sorting', () => {
    const mockTemplates = [
      {
        id: 'featured-1',
        name: 'Featured Template 1',
        category: 'test',
        description: 'Test description',
        icon: '🧪',
        systemInstruction: 'Test instruction',
        tags: ['test'],
        featured: true,
        popularity: 5
      },
      {
        id: 'featured-2',
        name: 'Featured Template 2',
        category: 'test',
        description: 'Test description',
        icon: '🧪',
        systemInstruction: 'Test instruction',
        tags: ['test'],
        featured: true,
        popularity: 3
      },
      {
        id: 'popular-1',
        name: 'Popular Template 1',
        category: 'test',
        description: 'Test description',
        icon: '🧪',
        systemInstruction: 'Test instruction',
        tags: ['test'],
        popularity: 10
      },
      {
        id: 'popular-2',
        name: 'Popular Template 2',
        category: 'test',
        description: 'Test description',
        icon: '🧪',
        systemInstruction: 'Test instruction',
        tags: ['test'],
        popularity: 8
      }
    ];

    test('getFeaturedTemplates returns featured templates first', () => {
      const featured = personalityService.getFeaturedTemplates(mockTemplates, 3);
      
      expect(featured.length).toBe(3);
      expect(featured[0].id).toBe('featured-1');
      expect(featured[1].id).toBe('featured-2');
      // Should include the most popular non-featured template
      expect(featured[2].id).toBe('popular-1');
    });

    test('getFeaturedTemplates respects limit parameter', () => {
      const featured = personalityService.getFeaturedTemplates(mockTemplates, 2);
      
      expect(featured.length).toBe(2);
      expect(featured[0].id).toBe('featured-1');
      expect(featured[1].id).toBe('featured-2');
    });

    test('getRecentTemplates returns templates in order of recency', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        recentPersonalityIds: ['popular-2', 'featured-1', 'popular-1']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const recent = personalityService.getRecentTemplates(mockTemplates);
      
      expect(recent.length).toBe(3);
      expect(recent[0].id).toBe('popular-2');
      expect(recent[1].id).toBe('featured-1');
      expect(recent[2].id).toBe('popular-1');
    });

    test('getRecentTemplates respects limit parameter', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        recentPersonalityIds: ['popular-2', 'featured-1', 'popular-1']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const recent = personalityService.getRecentTemplates(mockTemplates, 2);
      
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe('popular-2');
      expect(recent[1].id).toBe('featured-1');
    });

    test('getFavoriteTemplates returns favorite templates', () => {
      const initialPrefs: UserPreferences = {
        hasCompletedOnboarding: true,
        favoritePersonalityIds: ['featured-2', 'popular-1']
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialPrefs));
      
      const favorites = personalityService.getFavoriteTemplates(mockTemplates);
      
      expect(favorites.length).toBe(2);
      expect(favorites[0].id).toBe('featured-2');
      expect(favorites[1].id).toBe('popular-1');
    });
  });
});