import React, { useState, useEffect } from 'react';
import { templateService, MessageTemplate, TemplateCategory } from '../services/templateService';

interface TemplatePanelProps {
  onSelectTemplate: (template: MessageTemplate, variables: Record<string, string>) => void;
  onClose: () => void;
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(templateService.getTemplates());
    setCategories(templateService.getCategories());
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: MessageTemplate) => {
    if (template.variables && template.variables.length > 0) {
      setSelectedTemplate(template);
      // Initialize variables with default values
      const initialVariables: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialVariables[variable.name] = variable.defaultValue || '';
      });
      setTemplateVariables(initialVariables);
    } else {
      // No variables, use template directly
      templateService.useTemplate(template.id);
      onSelectTemplate(template, {});
      onClose();
    }
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;

    templateService.useTemplate(selectedTemplate.id);
    onSelectTemplate(selectedTemplate, templateVariables);
    onClose();
  };

  const handleToggleFavorite = (templateId: string) => {
    templateService.toggleFavorite(templateId);
    loadData();
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📝';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (selectedTemplate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Configure Template: {selectedTemplate.name}
            </h3>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {selectedTemplate.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {selectedTemplate.description}
              </p>
            )}

            {selectedTemplate.variables?.map(variable => (
              <div key={variable.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {variable.name.charAt(0).toUpperCase() + variable.name.slice(1)}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={templateVariables[variable.name] || ''}
                  onChange={(e) => setTemplateVariables(prev => ({
                    ...prev,
                    [variable.name]: e.target.value
                  }))}
                  placeholder={variable.placeholder}
                  rows={variable.name === 'code' || variable.name === 'text' ? 4 : 2}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-y"
                />
              </div>
            ))}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {templateService.processTemplate(selectedTemplate, templateVariables)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUseTemplate}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Message Templates
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

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                📋 All Templates ({templates.length})
              </button>

              <button
                onClick={() => setSelectedCategory('favorites')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'favorites'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                ⭐ Favorites ({templates.filter(t => t.favorite).length})
              </button>

              <button
                onClick={() => setSelectedCategory('recent')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'recent'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🕒 Recent ({templateService.getRecentTemplates().length})
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

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
                  {category.icon} {category.name} ({templateService.getTemplatesByCategory(category.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No templates found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: getCategoryColor(template.category) }}>
                          {getCategoryIcon(template.category)}
                        </span>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {template.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(template.id)}
                        className={`p-1 rounded transition-colors ${
                          template.favorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={template.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {template.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Used {template.useCount} times</span>
                        {template.variables && template.variables.length > 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                      >
                        Use
                      </button>
                    </div>

                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePanel;