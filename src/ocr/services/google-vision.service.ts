import { Injectable, Logger } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { IOcrService } from '../interfaces/ocr.interface';

@Injectable()
export class GoogleVisionService implements IOcrService {
  private client: ImageAnnotatorClient;
  private readonly logger = new Logger(GoogleVisionService.name);

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async extractText(imageBuffer: Buffer): Promise<string[]> {
    try {
      const [result] = await this.client.textDetection(imageBuffer);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        return [];
      }

      // The first annotation is the entire text
      return [detections[0].description || ''];
    } catch (error) {
      this.logger.error('Google Vision API Error:', error);
      throw error;
    }
  }
}
