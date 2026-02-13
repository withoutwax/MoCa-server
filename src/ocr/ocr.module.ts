import { Module } from '@nestjs/common';
import { DummyOcrService } from './services/dummy-ocr.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OcrProcessor } from './ocr.processor';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'OCR_SERVICE',
      useClass: DummyOcrService, // switched to Dummy
    },
    OcrProcessor,
  ],
  exports: ['OCR_SERVICE'],
})
export class OcrModule {}
