import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

describe('InvoiceController', () => {
  let app: INestApplication;
  let invoiceService: InvoiceService;

  // Mock Data
  const mockInvoice = {
    customer: 'Ahsan Amin',
    amount: 200,
    items: [{ sku: 'ITEM01', qt: 3 }],
    reference: 'REF123',
  };

  const mockInvoices = [mockInvoice];

  const mockInvoiceService = {
    create: jest.fn().mockResolvedValue(mockInvoice),
    getAllInvoices: jest.fn().mockResolvedValue(mockInvoices),
    findById: jest.fn().mockResolvedValue(mockInvoice),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    invoiceService = moduleFixture.get<InvoiceService>(InvoiceService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST invoices - should create a new invoice', async () => {
    const currentDate = new Date();
    const newInvoiceData = {
      customer: 'Ahsan Amin',
      amount: 200,
      reference: 'REF123',
      date: currentDate,
      items: [{ sku: 'ITEM01', qt: 3 }],
    };

    const response = await request(app.getHttpServer())
      .post('/invoices')
      .send(newInvoiceData)
      .expect(201);

    expect(response.body.reference).toEqual(mockInvoice.reference);
    expect(response.body.items).toEqual(mockInvoice.items);
  });

  it('/POST invoices - should return a 400 error', async () => {
    const currentDate = new Date();
    // some required fields are missing from this object
    const newInvoiceData = {
      date: currentDate,
      items: [{ sku: 'ITEM01', qt: 3 }],
    };

    const response = await request(app.getHttpServer())
      .post('/invoices')
      .send(newInvoiceData)
      .expect(400);

    expect(response.body.message).toContain('customer should not be empty');
  });

  it('/GET invoices - should return an array of invoices', async () => {
    const response = await request(app.getHttpServer())
      .get('/invoices')
      .expect(200);

    expect(response.body).toEqual(mockInvoices);
    expect(invoiceService.getAllInvoices).toHaveBeenCalled();
  });

  it('/GET invoices/:id - should return a single invoice by ID', async () => {
    const response = await request(app.getHttpServer())
      .get('/invoices/1')
      .expect(200);

    expect(response.body).toEqual(mockInvoice);
    expect(invoiceService.findById).toHaveBeenCalledWith('1');
  });

  it('/GET invoices/:id - should return 404 if invoice not found', async () => {
    jest
      .spyOn(invoiceService, 'findById')
      .mockRejectedValueOnce(new Error('Invoice not found'));

    await request(app.getHttpServer()).get('/invoices/2').expect(404);
  });
});
