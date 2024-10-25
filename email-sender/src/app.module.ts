import { Module } from '@nestjs/common';
import { EmailSenderController } from './email-sender.controller';

@Module({
  imports: [],
  controllers: [EmailSenderController],
})
export class AppModule {}
