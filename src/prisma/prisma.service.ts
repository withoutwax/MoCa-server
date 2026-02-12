import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, AccountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.seedMasterAdmin();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedMasterAdmin() {
    const adminEmail = 'rlagmlckd@gmail.com';
    const adminExists = await this.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      this.logger.log('Seeding Master Admin...');
      const hashedPassword = await bcrypt.hash('ilovemoca', 10);
      await this.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Master Admin',
          accountType: AccountType.ADMIN,
        },
      });
      this.logger.log('Master Admin seeded successfully.');
    } else {
      this.logger.log('Master Admin already exists.');
    }
  }
}
