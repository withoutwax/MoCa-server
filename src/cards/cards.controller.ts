import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CardsService } from './cards.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport'; // Assuming JWT auth is used

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('scan')
  // @UseGuards(AuthGuard('jwt')) // Uncomment if Auth is required and working
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async scanCard(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    // In a real app, get userId from Request (JWT), but for now possibly from body or hardcoded if auth not fully set up
    // Let's assume we receive userId or use a default one for testing if not auth.
    // Ideally: req.user.id
    const uId = userId ? parseInt(userId) : 1;

    return this.cardsService.createCardAndEnqueue(file.path, uId);
  }

  @Get()
  async getCards() {
    // Simple fetch all for demo
    return this.cardsService.findAll();
  }
}
