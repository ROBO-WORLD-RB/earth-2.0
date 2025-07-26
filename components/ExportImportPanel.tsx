import React, { useState } from 'react';
import { Conversation } from '../types';
import { exportImportService, ExportFormat, ImportResult } from '../services/exportImportService';

interface ExportImportPanelProps {
  conversations: Conversation[];
  onImportComplete: (result: ImportResult) => void;
  onClose: () => void;
}

const ExportImportPanel: React.FC<ExportImportPanelProps> = ({
  conversations,
  onImportComplete,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportOptions, setExportOptions] = useState({
    includeFiles: true,
    includeSettings: true,
    selectedConversations: [] as string[],
    dateRange: null as { start: Date; end: Date } | null
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const stats = exportImportService.getExportStats(conversations);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportImportService.exportConversations(
        conversations,
        exportFormat,
        exportOptions
      );
      
      exportImportService.downloadFile(result.data, result.filename, result.mimeType);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const format = file.name.endsWith('.json') ? 'json' : 'json'; // Only JSON supported for now
      const result = await exportImportService.importConversations(content, format);
      
      setImportResult(result);
      if (result.success) {
        onImportComplete(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: { conversations: 0, files: 0, settings: false },
        errors: [`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatDescription = (format: ExportFormat): string => {
    const descriptions = {
      json: 'Complete backup with all data (recommended for backup/restore)',
      markdown: 'Human-readable format for documentation and sharing',
      csv: 'Spreadsheet format for data analysis',
      html: 'Web page format for viewing and printing'
    };
    return descriptions[format];
  };

  const getFormatIcon = (format: ExportFormat): string => {
    const icons = {
      json: '📦',
      markdown: '📝',
      csv: '📊',
      html: '🌐'
    };
    return icons[format];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              📦 Export & Import
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Backup and restore your conversations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📤 Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📥 Import
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              {/* Export Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalConversations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalMessages}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Messages</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalWords.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatFileSize(stats.estimatedSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Est. Size</div>
                </div>
              </div>

              {/* Export Format Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Export Format
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {(['json', 'markdown', 'csv', 'html'] as ExportFormat[]).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        exportFormat === format
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getFormatIcon(format)}</span>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 uppercase">
                            {format}
                          </h5>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getFormatDescription(format)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Export Options
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFiles}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeFiles: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Include uploaded files
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSettings}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeSettings: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Include settings and preferences
                    </span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export {exportFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Import Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Drop your backup file here
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Import Status */}
              {isImporting && (
                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-800 dark:text-blue-200">Importing backup...</span>
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className={`p-4 rounded-lg ${
                  importResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {importResult.success ? (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <h4 className={`font-medium ${
                      importResult.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </h4>
                  </div>

                  {importResult.success && (
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                          {importResult.imported.conversations}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Conversations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                          {importResult.imported.files}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Files</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                          {importResult.imported.settings ? '✓' : '✗'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Settings</div>
                      </div>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-red-800 dark:text-red-200 mb-1">Errors:</h5>
                      <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importResult.warnings.length > 0 && (
                    <div>
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Warnings:</h5>
                      <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                        {importResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Import Instructions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  📋 Import Instructions
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Only JSON backup files are currently supported</li>
                  <li>• Existing conversations with the same ID will be skipped</li>
                  <li>• Settings will be merged with your current preferences</li>
                  <li>• Files will be restored to your local storage</li>
                  <li>• You may need to refresh the page after import</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportPanel;