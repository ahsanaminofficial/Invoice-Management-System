import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InvoiceModule } from './invoice.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), InvoiceModule],
})
export class AppModule {}
