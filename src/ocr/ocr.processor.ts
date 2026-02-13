import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IOcrService } from './interfaces/ocr.interface';
import { PrismaService } from '../prisma/prisma.service';
import { Status, PrismaClient } from '@prisma/client';

@Processor('ocr-queue')
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    @Inject('OCR_SERVICE') private readonly ocrService: IOcrService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(
    job: Job<{ cardId: number; imageUrl: string; userId: number }>,
  ): Promise<any> {
    const { cardId, imageUrl, userId } = job.data;
    this.logger.log(`Processing OCR for card ${cardId}`);

    try {
      // 1. Update Status to PROCESSING
      await this.prisma.card.update({
        where: { id: cardId },
        data: { status: Status.PROCESSING },
      });

      // 2. Extract Text (Polymorphism)
      // In a real app, we would download the image from the URL (or S3) into a buffer.
      // For this implementation, we'll assume the imageUrl is a local path or we fake the buffer if needed.
      // However, Google Vision Client accepts remote URIs directly in some methods, but our interface expects Buffer.
      // Let's assume for now we might need to fetch it.
      // For simplicity in this demo, let's try to fetch the image if it's a URL, or read file if local.
      // But implementation_plan said "multipart/form-data" -> "Save Card".
      // Let's assume the controller saves the file locally and passes the path or we assume we can read it.

      // Let's just create a dummy buffer for now or try to read it if it's a file path.
      // Since specific implementation details of file storage aren't in the prompt (just "Save temporary Card"),
      // and we want to keep it simple, let's assume `imageUrl` is a local file path.

      const fs = require('fs');
      // basic check if file exists
      if (!fs.existsSync(imageUrl)) {
        throw new Error(`File not found: ${imageUrl}`);
      }
      const imageBuffer = fs.readFileSync(imageUrl);

      const extractedTexts = await this.ocrService.extractText(imageBuffer);
      const fullText = extractedTexts.join('\n');

      this.logger.log(`Extracted Text: ${fullText.substring(0, 50)}...`);

      // 3. Parse Text (Simple mock parsing for now, or regex)
      const parsedData = this.parseText(fullText);

      // 4. Update Card -> COMPLETED
      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: {
          status: Status.COMPLETED,
          ...parsedData,
        },
      });

      // 5. Emit Event
      this.eventEmitter.emit('ocr.completed', {
        cardId,
        userId,
        data: updatedCard,
      });

      return parsedData;
    } catch (error) {
      this.logger.error(`OCR Failed for card ${cardId}`, error);
      await this.prisma.card.update({
        where: { id: cardId },
        data: { status: Status.FAILED },
      });
      // Optionally emit failure event
      this.eventEmitter.emit('ocr.failed', {
        cardId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  private parseText(text: string) {
    // Very naive parsing logic
    const lines = text.split('\n');
    let email: string | null = null;
    let phone: string | null = null;
    let name: string | null = null;

    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex =
      /(\+?\d{1,4}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{3,4}[\s-]?\d{4}/;

    for (const line of lines) {
      if (!email && emailRegex.test(line)) {
        email = line.match(emailRegex)?.[0] || null;
      }
      if (!phone && phoneRegex.test(line)) {
        phone = line.match(phoneRegex)?.[0] || null;
      }
      // Assume the first non-empty line that isn't email/phone is the name (very naive)
      if (
        !name &&
        line.trim().length > 0 &&
        !emailRegex.test(line) &&
        !phoneRegex.test(line)
      ) {
        name = line.trim();
      }
    }

    return {
      name,
      email,
      phone,
    };
  }
}
