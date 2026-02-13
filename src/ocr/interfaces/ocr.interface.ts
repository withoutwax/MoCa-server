export interface IOcrService {
  extractText(imageBuffer: Buffer): Promise<string[]>;
}
