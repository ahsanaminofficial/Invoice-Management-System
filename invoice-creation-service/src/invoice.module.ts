import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Invoice, InvoiceSchema } from '../schemas/invoice.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI],
          queue: 'daily_sales_report',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
