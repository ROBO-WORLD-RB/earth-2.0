// Template Service for message templates and snippets
// Provides quick access to commonly used message patterns

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  description?: string;
  variables?: TemplateVariable[];
  createdAt: number;
  lastUsed?: number;
  useCount: number;
  favorite: boolean;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  required: boolean;
  defaultValue?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

class TemplateService {
  private templates: MessageTemplate[] = [];
  private categories: TemplateCategory[] = [];
  private readonly TEMPLATES_KEY = 'earth-message-templates';
  private readonly CATEGORIES_KEY = 'earth-template-categories';

  constructor() {
    this.initializeDefaultCategories();
    this.loadTemplates();
    this.loadCategories();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultCategories(): void {
    this.categories = [
      {
        id: 'general',
        name: 'General',
        icon: '💬',
        color: '#6B7280',
        description: 'Common conversation starters and responses'
      },
      {
        id: 'coding',
        name: 'Coding',
        icon: '💻',
        color: '#3B82F6',
        description: 'Programming and development related templates'
      },
      {
        id: 'writing',
        name: 'Writing',
        icon: '✍️',
        color: '#10B981',
        description: 'Content creation and writing assistance'
      },
      {
        id: 'learning',
        name: 'Learning',
        icon: '📚',
        color: '#F59E0B',
        description: 'Educational and learning focused templates'
      },
      {
        id: 'creative',
        name: 'Creative',
        icon: '🎨',
        color: '#EF4444',
        description: 'Creative and brainstorming templates'
      },
      {
        id: 'business',
        name: 'Business',
        icon: '💼',
        color: '#8B5CF6',
        description: 'Professional and business communication'
      }
    ];
  }

  private initializeDefaultTemplates(): void {
    // Only add defaults if no templates exist
    if (this.templates.length === 0) {
      const defaultTemplates: Omit<MessageTemplate, 'id' | 'createdAt' | 'useCount' | 'lastUsed'>[] = [
        // General Templates
        {
          name: 'Explain Simply',
          content: 'Please explain {{topic}} in simple terms that a beginner can understand.',
          category: 'general',
          description: 'Ask for a simple explanation of any topic',
          variables: [{ name: 'topic', placeholder: 'the concept or topic', required: true }],
          favorite: false,
          tags: ['explanation', 'beginner']
        },
        {
          name: 'Pros and Cons',
          content: 'What are the pros and cons of {{topic}}? Please provide a balanced analysis.',
          category: 'general',
          description: 'Get a balanced analysis of any topic',
          variables: [{ name: 'topic', placeholder: 'the topic to analyze', required: true }],
          favorite: false,
          tags: ['analysis', 'comparison']
        },
        {
          name: 'Step by Step Guide',
          content: 'Can you provide a step-by-step guide on how to {{task}}?',
          category: 'general',
          description: 'Request detailed instructions for any task',
          variables: [{ name: 'task', placeholder: 'the task or process', required: true }],
          favorite: false,
          tags: ['guide', 'instructions']
        },

        // Coding Templates
        {
          name: 'Code Review',
          content: 'Please review this {{language}} code and suggest improvements:\n\n```{{language}}\n{{code}}\n```\n\nFocus on: performance, readability, and best practices.',
          category: 'coding',
          description: 'Get code review and improvement suggestions',
          variables: [
            { name: 'language', placeholder: 'programming language', required: true },
            { name: 'code', placeholder: 'your code here', required: true }
          ],
          favorite: false,
          tags: ['code-review', 'improvement']
        },
        {
          name: 'Debug Help',
          content: 'I\'m getting this error in my {{language}} code:\n\n```\n{{error}}\n```\n\nHere\'s my code:\n```{{language}}\n{{code}}\n```\n\nCan you help me fix it?',
          category: 'coding',
          description: 'Get help debugging code errors',
          variables: [
            { name: 'language', placeholder: 'programming language', required: true },
            { name: 'error', placeholder: 'error message', required: true },
            { name: 'code', placeholder: 'problematic code', required: true }
          ],
          favorite: false,
          tags: ['debugging', 'error-fixing']
        },
        {
          name: 'Code Explanation',
          content: 'Can you explain what this {{language}} code does, line by line?\n\n```{{language}}\n{{code}}\n```',
          category: 'coding',
          description: 'Get detailed code explanations',
          variables: [
            { name: 'language', placeholder: 'programming language', required: true },
            { name: 'code', placeholder: 'code to explain', required: true }
          ],
          favorite: false,
          tags: ['explanation', 'learning']
        },

        // Writing Templates
        {
          name: 'Improve Writing',
          content: 'Please improve this text for clarity, grammar, and style:\n\n{{text}}\n\nTarget audience: {{audience}}',
          category: 'writing',
          description: 'Improve any piece of writing',
          variables: [
            { name: 'text', placeholder: 'text to improve', required: true },
            { name: 'audience', placeholder: 'target audience', required: false, defaultValue: 'general audience' }
          ],
          favorite: false,
          tags: ['editing', 'improvement']
        },
        {
          name: 'Content Outline',
          content: 'Create a detailed outline for {{content_type}} about {{topic}}. Target audience: {{audience}}. Length: {{length}}.',
          category: 'writing',
          description: 'Generate content outlines',
          variables: [
            { name: 'content_type', placeholder: 'blog post, article, essay, etc.', required: true },
            { name: 'topic', placeholder: 'main topic', required: true },
            { name: 'audience', placeholder: 'target audience', required: false, defaultValue: 'general audience' },
            { name: 'length', placeholder: 'desired length', required: false, defaultValue: 'medium length' }
          ],
          favorite: false,
          tags: ['outline', 'planning']
        },

        // Learning Templates
        {
          name: 'Study Plan',
          content: 'Create a study plan for learning {{subject}} in {{timeframe}}. My current level: {{level}}. Learning goals: {{goals}}.',
          category: 'learning',
          description: 'Generate personalized study plans',
          variables: [
            { name: 'subject', placeholder: 'subject to learn', required: true },
            { name: 'timeframe', placeholder: 'available time period', required: true },
            { name: 'level', placeholder: 'beginner, intermediate, advanced', required: true },
            { name: 'goals', placeholder: 'specific learning goals', required: false }
          ],
          favorite: false,
          tags: ['study', 'planning']
        },
        {
          name: 'Quiz Me',
          content: 'Create a quiz with {{number}} questions about {{topic}}. Difficulty level: {{difficulty}}. Include answers at the end.',
          category: 'learning',
          description: 'Generate quizzes for any topic',
          variables: [
            { name: 'number', placeholder: 'number of questions', required: false, defaultValue: '10' },
            { name: 'topic', placeholder: 'quiz topic', required: true },
            { name: 'difficulty', placeholder: 'easy, medium, hard', required: false, defaultValue: 'medium' }
          ],
          favorite: false,
          tags: ['quiz', 'testing']
        },

        // Creative Templates
        {
          name: 'Brainstorm Ideas',
          content: 'Help me brainstorm creative ideas for {{project}}. Context: {{context}}. Target: {{target}}. Generate at least {{number}} unique ideas.',
          category: 'creative',
          description: 'Generate creative ideas for any project',
          variables: [
            { name: 'project', placeholder: 'your project or challenge', required: true },
            { name: 'context', placeholder: 'additional context', required: false },
            { name: 'target', placeholder: 'target audience or goal', required: false },
            { name: 'number', placeholder: 'number of ideas', required: false, defaultValue: '10' }
          ],
          favorite: false,
          tags: ['brainstorming', 'creativity']
        },
        {
          name: 'Story Prompt',
          content: 'Create a creative story prompt with these elements: Genre: {{genre}}, Setting: {{setting}}, Main character: {{character}}. Include a compelling conflict or challenge.',
          category: 'creative',
          description: 'Generate creative writing prompts',
          variables: [
            { name: 'genre', placeholder: 'story genre', required: false, defaultValue: 'any' },
            { name: 'setting', placeholder: 'story setting', required: false, defaultValue: 'any' },
            { name: 'character', placeholder: 'main character type', required: false, defaultValue: 'any' }
          ],
          favorite: false,
          tags: ['writing', 'creativity', 'story']
        },

        // Business Templates
        {
          name: 'Meeting Summary',
          content: 'Please help me create a professional meeting summary. Meeting topic: {{topic}}. Key points discussed: {{points}}. Action items: {{actions}}. Next steps: {{next_steps}}.',
          category: 'business',
          description: 'Create professional meeting summaries',
          variables: [
            { name: 'topic', placeholder: 'meeting topic', required: true },
            { name: 'points', placeholder: 'key discussion points', required: true },
            { name: 'actions', placeholder: 'action items', required: false },
            { name: 'next_steps', placeholder: 'next steps', required: false }
          ],
          favorite: false,
          tags: ['meeting', 'summary']
        },
        {
          name: 'Email Draft',
          content: 'Help me write a professional email. Purpose: {{purpose}}. Recipient: {{recipient}}. Key message: {{message}}. Tone: {{tone}}.',
          category: 'business',
          description: 'Draft professional emails',
          variables: [
            { name: 'purpose', placeholder: 'email purpose', required: true },
            { name: 'recipient', placeholder: 'recipient type/role', required: true },
            { name: 'message', placeholder: 'main message', required: true },
            { name: 'tone', placeholder: 'formal, casual, friendly', required: false, defaultValue: 'professional' }
          ],
          favorite: false,
          tags: ['email', 'communication']
        }
      ];

      // Add default templates
      defaultTemplates.forEach(template => {
        this.createTemplate(template);
      });
    }
  }

  // Template Management
  public getTemplates(): MessageTemplate[] {
    return [...this.templates].sort((a, b) => {
      // Sort by favorite first, then by last used, then by use count
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      if (a.lastUsed !== b.lastUsed) return (b.lastUsed || 0) - (a.lastUsed || 0);
      return b.useCount - a.useCount;
    });
  }

  public getTemplatesByCategory(categoryId: string): MessageTemplate[] {
    return this.templates
      .filter(template => template.category === categoryId)
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return b.useCount - a.useCount;
      });
  }

  public getFavoriteTemplates(): MessageTemplate[] {
    return this.templates.filter(template => template.favorite);
  }

  public getRecentTemplates(limit: number = 5): MessageTemplate[] {
    return this.templates
      .filter(template => template.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  }

  public searchTemplates(query: string): MessageTemplate[] {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.content.toLowerCase().includes(searchTerm) ||
      template.description?.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  public createTemplate(templateData: Omit<MessageTemplate, 'id' | 'createdAt' | 'useCount' | 'lastUsed'>): MessageTemplate {
    const template: MessageTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      useCount: 0
    };

    this.templates.push(template);
    this.saveTemplates();
    return template;
  }

  public updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate | null {
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return null;

    this.templates[index] = { ...this.templates[index], ...updates };
    this.saveTemplates();
    return this.templates[index];
  }

  public deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  public useTemplate(id: string): MessageTemplate | null {
    const template = this.templates.find(t => t.id === id);
    if (!template) return null;

    template.useCount++;
    template.lastUsed = Date.now();
    this.saveTemplates();
    return template;
  }

  public toggleFavorite(id: string): boolean {
    const template = this.templates.find(t => t.id === id);
    if (!template) return false;

    template.favorite = !template.favorite;
    this.saveTemplates();
    return template.favorite;
  }

  // Template Processing
  public processTemplate(template: MessageTemplate, variables: Record<string, string>): string {
    let content = template.content;

    // Replace variables in the format {{variableName}}
    if (template.variables) {
      template.variables.forEach(variable => {
        const value = variables[variable.name] || variable.defaultValue || variable.placeholder;
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(regex, value);
      });
    }

    // Replace any remaining variables with their placeholders
    content = content.replace(/{{(\w+)}}/g, (match, variableName) => {
      return variables[variableName] || `[${variableName}]`;
    });

    return content;
  }

  public extractVariables(content: string): TemplateVariable[] {
    const variableRegex = /{{(\w+)}}/g;
    const variables: TemplateVariable[] = [];
    const found = new Set<string>();

    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      const variableName = match[1];
      if (!found.has(variableName)) {
        found.add(variableName);
        variables.push({
          name: variableName,
          placeholder: `Enter ${variableName}`,
          required: true
        });
      }
    }

    return variables;
  }

  // Category Management
  public getCategories(): TemplateCategory[] {
    return [...this.categories];
  }

  public createCategory(categoryData: Omit<TemplateCategory, 'id'>): TemplateCategory {
    const category: TemplateCategory = {
      ...categoryData,
      id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.categories.push(category);
    this.saveCategories();
    return category;
  }

  public updateCategory(id: string, updates: Partial<TemplateCategory>): TemplateCategory | null {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return null;

    this.categories[index] = { ...this.categories[index], ...updates };
    this.saveCategories();
    return this.categories[index];
  }

  public deleteCategory(id: string): boolean {
    // Don't allow deleting default categories
    const defaultCategories = ['general', 'coding', 'writing', 'learning', 'creative', 'business'];
    if (defaultCategories.includes(id)) return false;

    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return false;

    // Move templates from deleted category to 'general'
    this.templates.forEach(template => {
      if (template.category === id) {
        template.category = 'general';
      }
    });

    this.categories.splice(index, 1);
    this.saveCategories();
    this.saveTemplates();
    return true;
  }

  // Persistence
  private saveTemplates(): void {
    try {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this.templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  private loadTemplates(): void {
    try {
      const saved = localStorage.getItem(this.TEMPLATES_KEY);
      if (saved) {
        this.templates = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templates = [];
    }
  }

  private saveCategories(): void {
    try {
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(this.categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  private loadCategories(): void {
    try {
      const saved = localStorage.getItem(this.CATEGORIES_KEY);
      if (saved) {
        // Merge with default categories to ensure they exist
        const savedCategories = JSON.parse(saved);
        this.categories = this.categories.map(defaultCat => {
          const saved = savedCategories.find((c: TemplateCategory) => c.id === defaultCat.id);
          return saved || defaultCat;
        });
        
        // Add any custom categories
        savedCategories.forEach((savedCat: TemplateCategory) => {
          if (!this.categories.find(c => c.id === savedCat.id)) {
            this.categories.push(savedCat);
          }
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
}

// Create singleton instance
export const templateService = new TemplateService();
export default templateService;