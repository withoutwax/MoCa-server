import { Module } from '@nestjs/common';
import { GoogleVisionService } from './services/google-vision.service';
import { OcrProcessor } from './ocr.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'OCR_SERVICE',
      useClass: GoogleVisionService,
    },
    OcrProcessor,
  ],
  exports: ['OCR_SERVICE'],
})
export class OcrModule {}
