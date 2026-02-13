import { Injectable, Logger } from '@nestjs/common';
import { IOcrService } from '../interfaces/ocr.interface';

@Injectable()
export class DummyOcrService implements IOcrService {
  private readonly logger = new Logger(DummyOcrService.name);

  async extractText(imageBuffer: Buffer): Promise<string[]> {
    this.logger.log('Simulating OCR extraction...');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return dummy text that matches our naive parser's expectations
    return [
      'John Doe',
      'Software Engineer',
      'Acme Corp',
      'E: john.doe@example.com',
      'P: +1 555-010-9999',
      '123 Innovation Dr, Tech City',
    ];
  }
}
