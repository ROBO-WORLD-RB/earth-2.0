import React, { useState, useEffect } from 'react';
import { personalityService, SavedPersonality } from '../services/personalityService';
import { personalityTemplates } from '../data/personalityTemplates';

interface PersonalityManagerProps {
  currentInstruction: string;
  onPersonalityChange: (instruction: string, name: string) => void;
  onClose: () => void;
}

// SavedPersonality now includes all needed properties

const PersonalityManager: React.FC<PersonalityManagerProps> = ({
  currentInstruction,
  onPersonalityChange,
  onClose
}) => {
  const [personalities, setPersonalities] = useState<SavedPersonality[]>([]);
  const [selectedPersonality, setSelectedPersonality] = useState<SavedPersonality | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadPersonalities();
  }, []);

  const loadPersonalities = () => {
    const saved = personalityService.getSavedPersonalities();
    setPersonalities(saved);
  };

  const handlePersonalitySelect = (personality: SavedPersonality) => {
    personalityService.usePersonality(personality.id);
    onPersonalityChange(personality.instruction, personality.name);
    loadPersonalities(); // Refresh to update use count
    onClose();
  };

  const handleToggleFavorite = (personalityId: string) => {
    personalityService.toggleFavorite(personalityId);
    loadPersonalities();
  };

  const handleDeletePersonality = (personalityId: string) => {
    if (confirm('Are you sure you want to delete this personality?')) {
      personalityService.deletePersonality(personalityId);
      loadPersonalities();
    }
  };

  const filteredPersonalities = personalities.filter(personality => {
    const matchesSearch = !searchQuery || 
      personality.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      personality.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      personality.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'favorites' && personality.favorite) ||
      (selectedCategory === 'recent' && personality.lastUsed) ||
      personality.tags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Personalities', icon: '🧠' },
    { id: 'favorites', name: 'Favorites', icon: '⭐' },
    { id: 'recent', name: 'Recently Used', icon: '🕒' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'technical', name: 'Technical', icon: '💻' },
    { id: 'educational', name: 'Educational', icon: '📚' },
    { id: 'business', name: 'Business', icon: '💼' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            AI Personality Manager
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create New
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personalities..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Templates Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Pre-built Templates
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personalityTemplates.map(template => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{template.avatar}</span>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {template.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <button
                      onClick={() => onPersonalityChange(template.systemInstruction, template.name)}
                      className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Personalities */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Your Personalities ({personalities.length})
              </h4>
              
              {filteredPersonalities.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>No personalities found</p>
                  <p className="text-sm mt-1">Create your first AI personality to get started</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPersonalities.map(personality => (
                    <div
                      key={personality.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{personality.avatar || '🤖'}</span>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {personality.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Used {personality.useCount} times
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(personality.id)}
                            className={`p-1 rounded transition-colors ${
                              personality.favorite
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={personality.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePersonality(personality.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {personality.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {personality.description}
                        </p>
                      )}

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {personality.instruction}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {personality.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handlePersonalitySelect(personality)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreatePersonalityForm
          onSave={(personality) => {
            personalityService.savePersonality(personality);
            loadPersonalities();
            setShowCreateForm(false);
          }}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

// Create Personality Form Component
interface CreatePersonalityFormProps {
  onSave: (personality: Omit<SavedPersonality, 'id' | 'createdAt' | 'useCount' | 'lastUsed'>) => void;
  onClose: () => void;
}

const CreatePersonalityForm: React.FC<CreatePersonalityFormProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    instruction: '',
    description: '',
    avatar: '🤖',
    tags: [] as string[],
    favorite: false
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.instruction.trim()) return;

    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const avatarOptions = ['🤖', '👨‍💻', '👩‍💻', '🧠', '🎨', '📚', '💼', '🔬', '🎭', '🌟', '💡', '🚀'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create New Personality
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Creative Writer, Code Reviewer"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  className={`p-2 text-2xl rounded-lg border-2 transition-colors ${
                    formData.avatar === avatar
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this personality"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Instruction *
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) => setFormData(prev => ({ ...prev, instruction: e.target.value }))}
              placeholder="Enter the system instruction that defines this AI personality..."
              rows={6}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.favorite}
              onChange={(e) => setFormData(prev => ({ ...prev, favorite: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="favorite" className="text-sm text-gray-700 dark:text-gray-300">
              Add to favorites
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create Personality
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalityManager;