import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Dynamic import for pdf-parse to handle build issues
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.warn('pdf-parse not available:', error);
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  keywords?: string[];
  pageCount?: number;
  wordCount?: number;
  textContent?: string;
  extractedText?: string;
  language?: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface DocumentProcessingResult {
  success: boolean;
  metadata: DocumentMetadata;
  textContent?: string;
  error?: string;
}

class DocumentProcessor {
  
  /**
   * Process a document and extract metadata and content
   */
  async processDocument(filePath: string, mimeType: string): Promise<DocumentProcessingResult> {
    try {
      const stats = fs.statSync(filePath);
      const baseMetadata: DocumentMetadata = {
        fileSize: stats.size,
        creationDate: stats.birthtime,
        modificationDate: stats.mtime,
      };

      switch (true) {
        case mimeType.includes('pdf'):
          return await this.processPDF(filePath, baseMetadata);
        
        case mimeType.includes('word') || mimeType.includes('document'):
          return await this.processWord(filePath, baseMetadata);
        
        case mimeType.includes('excel') || mimeType.includes('spreadsheet'):
          return await this.processExcel(filePath, baseMetadata);
        
        case mimeType.includes('powerpoint') || mimeType.includes('presentation'):
          return await this.processPowerPoint(filePath, baseMetadata);
        
        case mimeType.startsWith('image/'):
          return await this.processImage(filePath, baseMetadata);
        
        case mimeType.startsWith('text/'):
          return await this.processText(filePath, baseMetadata);
        
        default:
          return {
            success: true,
            metadata: baseMetadata,
            textContent: '',
          };
      }
    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        metadata: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Process PDF documents
   */
  private async processPDF(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    try {
      if (!pdfParse) {
        console.warn('PDF processing not available - pdf-parse module not loaded');
        return {
          success: false,
          error: 'PDF processing not available',
          metadata: baseMetadata
        };
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      const metadata: DocumentMetadata = {
        ...baseMetadata,
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        subject: pdfData.info?.Subject || undefined,
        creator: pdfData.info?.Creator || undefined,
        producer: pdfData.info?.Producer || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : baseMetadata.creationDate,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : baseMetadata.modificationDate,
        pageCount: pdfData.numpages,
        textContent: pdfData.text,
        extractedText: pdfData.text,
        wordCount: pdfData.text ? pdfData.text.split(/\s+/).length : 0,
      };

      return {
        success: true,
        metadata,
        textContent: pdfData.text,
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        metadata: baseMetadata,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process Word documents
   */
  private async processWord(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const textContent = result.value;

      const metadata: DocumentMetadata = {
        ...baseMetadata,
        textContent,
        extractedText: textContent,
        wordCount: textContent ? textContent.split(/\s+/).length : 0,
        language: this.detectLanguage(textContent),
      };

      return {
        success: true,
        metadata,
        textContent,
      };
    } catch (error) {
      console.error('Word processing error:', error);
      return {
        success: false,
        metadata: baseMetadata,
        error: `Word document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process Excel documents
   */
  private async processExcel(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      
      let allText = '';
      let cellCount = 0;

      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        sheetData.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (cell && typeof cell === 'string') {
                allText += cell + ' ';
                cellCount++;
              }
            });
          }
        });
      });

      const metadata: DocumentMetadata = {
        ...baseMetadata,
        textContent: allText.trim(),
        extractedText: allText.trim(),
        wordCount: allText ? allText.split(/\s+/).length : 0,
        pageCount: sheetNames.length,
      };

      return {
        success: true,
        metadata,
        textContent: allText.trim(),
      };
    } catch (error) {
      console.error('Excel processing error:', error);
      return {
        success: false,
        metadata: baseMetadata,
        error: `Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process PowerPoint documents  
   */
  private async processPowerPoint(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    // For PowerPoint, we'll use a basic approach since there's no simple Node.js library
    // This could be enhanced with more sophisticated processing
    try {
      const metadata: DocumentMetadata = {
        ...baseMetadata,
        textContent: 'PowerPoint document - content extraction requires specialized tools',
        extractedText: 'PowerPoint document',
      };

      return {
        success: true,
        metadata,
        textContent: metadata.textContent,
      };
    } catch (error) {
      return {
        success: false,
        metadata: baseMetadata,
        error: `PowerPoint processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process image documents
   */
  private async processImage(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    try {
      const imageBuffer = fs.readFileSync(filePath);
      const imageMetadata = await sharp(imageBuffer).metadata();

      const metadata: DocumentMetadata = {
        ...baseMetadata,
        dimensions: {
          width: imageMetadata.width || 0,
          height: imageMetadata.height || 0,
        },
        textContent: `Image file - ${imageMetadata.width}x${imageMetadata.height} pixels`,
        extractedText: 'Image file',
      };

      return {
        success: true,
        metadata,
        textContent: metadata.textContent,
      };
    } catch (error) {
      return {
        success: false,
        metadata: baseMetadata,
        error: `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process text documents
   */
  private async processText(filePath: string, baseMetadata: DocumentMetadata): Promise<DocumentProcessingResult> {
    try {
      const textContent = fs.readFileSync(filePath, 'utf-8');

      const metadata: DocumentMetadata = {
        ...baseMetadata,
        textContent,
        extractedText: textContent,
        wordCount: textContent ? textContent.split(/\s+/).length : 0,
        language: this.detectLanguage(textContent),
      };

      return {
        success: true,
        metadata,
        textContent,
      };
    } catch (error) {
      return {
        success: false,
        metadata: baseMetadata,
        error: `Text processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Simple language detection based on common words
   */
  private detectLanguage(text: string): string {
    if (!text) return 'Unknown';

    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    const lowerText = text.toLowerCase();
    
    const englishWordCount = englishWords.filter(word => 
      lowerText.includes(` ${word} `) || 
      lowerText.startsWith(`${word} `) || 
      lowerText.endsWith(` ${word}`)
    ).length;

    if (englishWordCount >= 3) {
      return 'English';
    }

    return 'Unknown';
  }

  /**
   * Extract keywords from text content
   */
  extractKeywords(text: string, maxKeywords: number = 10): string[] {
    if (!text) return [];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'them', 'were', 'said', 'each', 'which', 'their', 'time', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'most', 'other', 'such', 'long', 'make', 'thing', 'see', 'him', 'two', 'how', 'its', 'who', 'oil', 'sit', 'but', 'not', 'had', 'has', 'was', 'one', 'our', 'out', 'day', 'get', 'use', 'man', 'new', 'now', 'old', 'see', 'him', 'two', 'way', 'may', 'say']);

    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
}

export const documentProcessor = new DocumentProcessor();