import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(
    @InjectQueue('ocr-queue') private ocrQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async createCardAndEnqueue(imagePath: string, userId: number) {
    // 1. Save Card as PENDING
    const card = await this.prisma.card.create({
      data: {
        userId: userId,
        imageUrl: imagePath,
        status: Status.PENDING,
      },
    });

    // 2. Add Job to Queue
    await this.ocrQueue.add('process-card', {
      cardId: card.id,
      imageUrl: imagePath,
      userId: userId,
    });

    // 3. Return immediately
    return {
      cardId: card.id,
      status: card.status,
      imageUrl: card.imageUrl,
    };
  }

  async findAll() {
    return this.prisma.card.findMany();
  }
}
