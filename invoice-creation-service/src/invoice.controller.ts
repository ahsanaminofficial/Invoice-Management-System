import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { InvoiceService } from './invoice.service';
import { Invoice } from '../schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}
  private readonly logger = new Logger('Invoice Controller Service');

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createInvoice(
    @Body() invoiceData: CreateInvoiceDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.logger.log(
      `Request received to create an invoice, Req: ${invoiceData}`,
    );
    const reqInvoice = invoiceData as Invoice;
    const invoice = await this.invoiceService.create(reqInvoice);
    this.logger.log(`Created an invoice ${invoice}`);
    return res.status(HttpStatus.CREATED).json(invoice);
  }

  @Get()
  getAllInvoices(): Promise<Invoice[]> {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  async getInvoiceById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const invoice = await this.invoiceService.findById(id);
      return res.status(HttpStatus.OK).json(invoice);
    } catch (error) {
      this.logger.error(
        `Error occurred while retrieving invoice with invoice id: ${id}, Error: ${error}`,
      );
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Invoice not found' });
    }
  }
}
