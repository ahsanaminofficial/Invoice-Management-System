import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}
  private readonly logger = new Logger('Invoice Controller Service');

  async getAllInvoices(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async create(invoiceData: Invoice): Promise<Invoice> {
    invoiceData.date = new Date();
    const createdInvoice = await this.invoiceModel.create(invoiceData);
    return createdInvoice;
  }

  async getTotalAmountForLast24Hours(): Promise<number> {
    const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    const invoices = await this.invoiceModel
      .find({
        date: { $gte: last24Hours },
      })
      .exec();

    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0,
    );

    return totalAmount;
  }

  async getTotalQuantityBySKU(): Promise<any> {
    const result = await this.invoiceModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.sku',
          totalQuantitySold: { $sum: '$items.qt' },
        },
      },
    ]);

    return result;
  }

  @Cron('0 12 * * *')
  async handleDailyCron() {
    this.logger.log('Daily cron job running at 12 pm');

    const totalAmount = await this.getTotalAmountForLast24Hours();
    this.logger.log(`Total Amount: ${totalAmount}`);

    const quantity_per_item = await this.getTotalQuantityBySKU();
    this.logger.log(
      `Quantity per item sold: ${JSON.stringify(quantity_per_item)}`,
    );

    this.client.emit('summary_created', {
      totalSales: totalAmount,
      quantity_per_item: quantity_per_item,
    });
  }
}
