// Export/Import Service for conversation backup and restore
// Supports multiple formats and data migration

import { Conversation, FileMessage } from '../types';
import { fileStorage } from './fileStorage';

export interface ExportData {
  version: string;
  exportDate: string;
  conversations: Conversation[];
  files: FileMessage[];
  settings: {
    systemInstruction: string;
    personalities: any[];
    templates: any[];
    preferences: any;
  };
  metadata: {
    totalConversations: number;
    totalMessages: number;
    totalFiles: number;
    exportSize: number;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    conversations: number;
    files: number;
    settings: boolean;
  };
  errors: string[];
  warnings: string[];
}

export type ExportFormat = 'json' | 'markdown' | 'csv' | 'html';

class ExportImportService {
  private readonly CURRENT_VERSION = '1.0.0';

  // Export conversations in various formats
  public async exportConversations(
    conversations: Conversation[],
    format: ExportFormat = 'json',
    options: {
      includeFiles?: boolean;
      includeSettings?: boolean;
      selectedConversations?: string[];
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    const {
      includeFiles = true,
      includeSettings = true,
      selectedConversations,
      dateRange
    } = options;

    // Filter conversations
    let filteredConversations = conversations;
    
    if (selectedConversations) {
      filteredConversations = conversations.filter(conv => 
        selectedConversations.includes(conv.id)
      );
    }

    if (dateRange) {
      filteredConversations = filteredConversations.filter(conv => {
        const convDate = new Date(parseInt(conv.id));
        return convDate >= dateRange.start && convDate <= dateRange.end;
      });
    }

    switch (format) {
      case 'json':
        return this.exportAsJSON(filteredConversations, includeFiles, includeSettings);
      case 'markdown':
        return this.exportAsMarkdown(filteredConversations);
      case 'csv':
        return this.exportAsCSV(filteredConversations);
      case 'html':
        return this.exportAsHTML(filteredConversations);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Export as JSON (full backup)
  private async exportAsJSON(
    conversations: Conversation[],
    includeFiles: boolean,
    includeSettings: boolean
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    const files: FileMessage[] = [];
    
    if (includeFiles) {
      for (const conversation of conversations) {
        try {
          const conversationFiles = await fileStorage.getFilesByConversation(conversation.id);
          files.push(...conversationFiles);
        } catch (error) {
          console.warn(`Failed to load files for conversation ${conversation.id}:`, error);
        }
      }
    }

    const settings = includeSettings ? {
      systemInstruction: localStorage.getItem('earth-system-instruction') || '',
      personalities: JSON.parse(localStorage.getItem('earth-personalities') || '[]'),
      templates: JSON.parse(localStorage.getItem('earth-message-templates') || '[]'),
      preferences: {
        theme: localStorage.getItem('earth-theme') || 'light',
        voiceSettings: JSON.parse(localStorage.getItem('earth-voice-settings') || '{}')
      }
    } : {};

    const exportData: ExportData = {
      version: this.CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      conversations,
      files,
      settings,
      metadata: {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
        totalFiles: files.length,
        exportSize: 0 // Will be calculated after stringification
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    exportData.metadata.exportSize = new Blob([jsonString]).size;

    const timestamp = new Date().toISOString().split('T')[0];
    return {
      data: jsonString,
      filename: `earth-backup-${timestamp}.json`,
      mimeType: 'application/json'
    };
  }

  // Export as Markdown
  private async exportAsMarkdown(conversations: Conversation[]): Promise<{ data: string; filename: string; mimeType: string }> {
    let markdown = `# EARTH AI Conversations Export\n\n`;
    markdown += `**Export Date:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Total Conversations:** ${conversations.length}\n\n`;
    markdown += `---\n\n`;

    conversations.forEach((conversation, index) => {
      markdown += `## ${conversation.title}\n\n`;
      markdown += `**Conversation ${index + 1}** | **Messages:** ${conversation.messages.length}\n\n`;

      conversation.messages.forEach((message, msgIndex) => {
        const role = message.role === 'user' ? '👤 **You**' : '🤖 **AI**';
        markdown += `### ${role}\n\n`;
        markdown += `${message.content}\n\n`;

        if (message.files && message.files.length > 0) {
          markdown += `**Attachments:**\n`;
          message.files.forEach(file => {
            markdown += `- 📎 ${file.name} (${this.formatFileSize(file.size)})\n`;
          });
          markdown += `\n`;
        }

        markdown += `---\n\n`;
      });

      markdown += `\n\n`;
    });

    const timestamp = new Date().toISOString().split('T')[0];
    return {
      data: markdown,
      filename: `earth-conversations-${timestamp}.md`,
      mimeType: 'text/markdown'
    };
  }

  // Export as CSV
  private async exportAsCSV(conversations: Conversation[]): Promise<{ data: string; filename: string; mimeType: string }> {
    const headers = ['Conversation Title', 'Message Index', 'Role', 'Content', 'Has Files', 'File Count', 'Timestamp'];
    let csv = headers.join(',') + '\n';

    conversations.forEach(conversation => {
      conversation.messages.forEach((message, index) => {
        const row = [
          `"${conversation.title.replace(/"/g, '""')}"`,
          index + 1,
          message.role,
          `"${message.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          message.files && message.files.length > 0 ? 'Yes' : 'No',
          message.files?.length || 0,
          new Date(parseInt(conversation.id)).toISOString()
        ];
        csv += row.join(',') + '\n';
      });
    });

    const timestamp = new Date().toISOString().split('T')[0];
    return {
      data: csv,
      filename: `earth-conversations-${timestamp}.csv`,
      mimeType: 'text/csv'
    };
  }

  // Export as HTML
  private async exportAsHTML(conversations: Conversation[]): Promise<{ data: string; filename: string; mimeType: string }> {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EARTH AI Conversations Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .conversation { margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .conversation-header { background: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0; }
        .message { padding: 20px; border-bottom: 1px solid #f1f5f9; }
        .message:last-child { border-bottom: none; }
        .user-message { background: #f0f9ff; }
        .ai-message { background: #fefefe; }
        .message-role { font-weight: 600; margin-bottom: 10px; }
        .user-role { color: #0369a1; }
        .ai-role { color: #7c3aed; }
        .message-content { white-space: pre-wrap; }
        .attachments { margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 4px; }
        .attachment { display: inline-block; margin: 2px 5px 2px 0; padding: 2px 8px; background: #e2e8f0; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 EARTH AI Conversations</h1>
        <p>Export Date: ${new Date().toLocaleDateString()}</p>
        <p>Total Conversations: ${conversations.length}</p>
    </div>
`;

    conversations.forEach((conversation, index) => {
      html += `
    <div class="conversation">
        <div class="conversation-header">
            <h2>${this.escapeHtml(conversation.title)}</h2>
            <p>Conversation ${index + 1} • ${conversation.messages.length} messages</p>
        </div>
`;

      conversation.messages.forEach(message => {
        const isUser = message.role === 'user';
        html += `
        <div class="message ${isUser ? 'user-message' : 'ai-message'}">
            <div class="message-role ${isUser ? 'user-role' : 'ai-role'}">
                ${isUser ? '👤 You' : '🤖 AI'}
            </div>
            <div class="message-content">${this.escapeHtml(message.content)}</div>
`;

        if (message.files && message.files.length > 0) {
          html += `
            <div class="attachments">
                <strong>Attachments:</strong>
`;
          message.files.forEach(file => {
            html += `<span class="attachment">📎 ${this.escapeHtml(file.name)} (${this.formatFileSize(file.size)})</span>`;
          });
          html += `
            </div>
`;
        }

        html += `
        </div>
`;
      });

      html += `
    </div>
`;
    });

    html += `
</body>
</html>`;

    const timestamp = new Date().toISOString().split('T')[0];
    return {
      data: html,
      filename: `earth-conversations-${timestamp}.html`,
      mimeType: 'text/html'
    };
  }

  // Import conversations from backup
  public async importConversations(fileContent: string, format: ExportFormat = 'json'): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: { conversations: 0, files: 0, settings: false },
      errors: [],
      warnings: []
    };

    try {
      switch (format) {
        case 'json':
          return await this.importFromJSON(fileContent);
        default:
          result.errors.push(`Import format '${format}' is not supported yet`);
          return result;
      }
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Import from JSON backup
  private async importFromJSON(jsonContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: { conversations: 0, files: 0, settings: false },
      errors: [],
      warnings: []
    };

    try {
      const exportData: ExportData = JSON.parse(jsonContent);

      // Version compatibility check
      if (exportData.version !== this.CURRENT_VERSION) {
        result.warnings.push(`Version mismatch: backup is v${exportData.version}, current is v${this.CURRENT_VERSION}`);
      }

      // Import conversations
      if (exportData.conversations && exportData.conversations.length > 0) {
        const existingConversations = JSON.parse(localStorage.getItem('earth-conversations') || '[]');
        const mergedConversations = [...existingConversations];

        exportData.conversations.forEach(conversation => {
          // Check for duplicates
          const existingIndex = mergedConversations.findIndex(c => c.id === conversation.id);
          if (existingIndex !== -1) {
            result.warnings.push(`Conversation "${conversation.title}" already exists, skipping`);
          } else {
            mergedConversations.push(conversation);
            result.imported.conversations++;
          }
        });

        localStorage.setItem('earth-conversations', JSON.stringify(mergedConversations));
      }

      // Import files
      if (exportData.files && exportData.files.length > 0) {
        for (const file of exportData.files) {
          try {
            await fileStorage.saveFile(file);
            result.imported.files++;
          } catch (error) {
            result.warnings.push(`Failed to import file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Import settings
      if (exportData.settings) {
        try {
          if (exportData.settings.systemInstruction) {
            localStorage.setItem('earth-system-instruction', exportData.settings.systemInstruction);
          }
          if (exportData.settings.personalities) {
            localStorage.setItem('earth-personalities', JSON.stringify(exportData.settings.personalities));
          }
          if (exportData.settings.templates) {
            localStorage.setItem('earth-message-templates', JSON.stringify(exportData.settings.templates));
          }
          if (exportData.settings.preferences) {
            if (exportData.settings.preferences.theme) {
              localStorage.setItem('earth-theme', exportData.settings.preferences.theme);
            }
            if (exportData.settings.preferences.voiceSettings) {
              localStorage.setItem('earth-voice-settings', JSON.stringify(exportData.settings.preferences.voiceSettings));
            }
          }
          result.imported.settings = true;
        } catch (error) {
          result.warnings.push(`Failed to import some settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = true;
    } catch (error) {
      result.errors.push(`Failed to parse backup file: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }

    return result;
  }

  // Download file helper
  public downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Utility functions
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Get export statistics
  public getExportStats(conversations: Conversation[]): {
    totalConversations: number;
    totalMessages: number;
    totalWords: number;
    estimatedSize: number;
  } {
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const totalWords = conversations.reduce((sum, conv) => 
      sum + conv.messages.reduce((msgSum, msg) => 
        msgSum + msg.content.split(/\s+/).length, 0), 0);
    
    // Rough size estimation
    const estimatedSize = JSON.stringify(conversations).length;

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalWords,
      estimatedSize
    };
  }
}

// Create singleton instance
export const exportImportService = new ExportImportService();
export default exportImportService;