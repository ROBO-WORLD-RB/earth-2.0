// Advanced File Service for enhanced file processing
// Supports PDF text extraction, code syntax highlighting, and batch processing

import { FileMessage } from '../types';

export interface ProcessedFile extends FileMessage {
  extractedText?: string;
  language?: string;
  syntaxHighlighted?: boolean;
  thumbnail?: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  pages?: number;
  wordCount?: number;
  language?: string;
  encoding?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

export interface BatchProcessResult {
  successful: ProcessedFile[];
  failed: { file: File; error: string }[];
  totalSize: number;
}

class AdvancedFileService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly SUPPORTED_CODE_EXTENSIONS = [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 
    'rs', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'sass', 'less', 'xml', 
    'json', 'yaml', 'yml', 'md', 'sql', 'sh', 'bash', 'ps1', 'r', 'matlab', 'm'
  ];

  // PDF Processing using PDF.js
  public async processPDF(file: File): Promise<ProcessedFile> {
    try {
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      const numPages = pdf.numPages;

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += `Page ${pageNum}:\n${pageText}\n\n`;
      }

      // Create thumbnail from first page
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await firstPage.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        content: await this.fileToBase64(file),
        uploadDate: new Date(),
        extractedText,
        thumbnail,
        metadata: {
          pages: numPages,
          wordCount: extractedText.split(/\s+/).length
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Code file processing with syntax detection
  public async processCodeFile(file: File): Promise<ProcessedFile> {
    try {
      const content = await this.fileToText(file);
      const extension = this.getFileExtension(file.name);
      const language = this.detectLanguage(extension, content);

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        uploadDate: new Date(),
        language,
        syntaxHighlighted: true,
        metadata: {
          language,
          wordCount: content.split(/\s+/).length,
          encoding: 'UTF-8'
        }
      };
    } catch (error) {
      console.error('Code file processing error:', error);
      throw new Error(`Failed to process code file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Image processing with analysis
  public async processImage(file: File): Promise<ProcessedFile> {
    try {
      const base64Content = await this.fileToBase64(file);
      
      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);
      
      // Create thumbnail
      const thumbnail = await this.createImageThumbnail(file, 200, 200);

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64Content,
        uploadDate: new Date(),
        thumbnail,
        metadata: {
          dimensions
        }
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Batch file processing
  public async processBatch(files: File[]): Promise<BatchProcessResult> {
    const result: BatchProcessResult = {
      successful: [],
      failed: [],
      totalSize: 0
    };

    const processPromises = files.map(async (file) => {
      try {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
          throw new Error(`File too large (max ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
        }

        let processedFile: ProcessedFile;

        if (file.type === 'application/pdf') {
          processedFile = await this.processPDF(file);
        } else if (file.type.startsWith('image/')) {
          processedFile = await this.processImage(file);
        } else if (this.isCodeFile(file)) {
          processedFile = await this.processCodeFile(file);
        } else {
          // Default text processing
          processedFile = await this.processTextFile(file);
        }

        result.successful.push(processedFile);
        result.totalSize += file.size;
      } catch (error) {
        result.failed.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    await Promise.all(processPromises);
    return result;
  }

  // Default text file processing
  private async processTextFile(file: File): Promise<ProcessedFile> {
    const content = await this.fileToText(file);
    
    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      uploadDate: new Date(),
      metadata: {
        wordCount: content.split(/\s+/).length,
        encoding: 'UTF-8'
      }
    };
  }

  // Utility methods
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private isCodeFile(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return this.SUPPORTED_CODE_EXTENSIONS.includes(extension) || 
           file.type.includes('text/') ||
           file.type.includes('application/json') ||
           file.type.includes('application/xml');
  }

  private detectLanguage(extension: string, content: string): string {
    // Language detection based on file extension
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'xml': 'xml',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'ps1': 'powershell',
      'r': 'r',
      'matlab': 'matlab',
      'm': 'matlab'
    };

    const detectedLang = languageMap[extension];
    if (detectedLang) return detectedLang;

    // Content-based detection for common patterns
    if (content.includes('import React') || content.includes('from \'react\'')) {
      return 'jsx';
    }
    if (content.includes('def ') && content.includes(':')) {
      return 'python';
    }
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
      return 'javascript';
    }
    if (content.includes('public class ') || content.includes('private ')) {
      return 'java';
    }

    return 'text';
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async createImageThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate thumbnail dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // File validation
  public validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Check for potentially dangerous file types
    const dangerousTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msdos-program'
    ];

    if (dangerousTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported for security reasons'
      };
    }

    return { valid: true };
  }

  // Get supported file types
  public getSupportedTypes(): string[] {
    return [
      'application/pdf',
      'text/*',
      'image/*',
      'application/json',
      'application/xml',
      ...this.SUPPORTED_CODE_EXTENSIONS.map(ext => `.${ext}`)
    ];
  }
}

// Create singleton instance
export const advancedFileService = new AdvancedFileService();
export default advancedFileService;