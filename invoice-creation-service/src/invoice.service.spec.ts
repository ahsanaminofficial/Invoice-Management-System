import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { InvoiceService } from './invoice.service';
import { Invoice } from '../schemas/invoice.schema';
import { NotFoundException } from '@nestjs/common';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let model: any;
  let client: ClientProxy;

  const mockInvoiceModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    model = module.get(getModelToken(Invoice.name));
    client = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices', async () => {
      const invoices = [{ id: '1', amount: 100 }];
      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(invoices),
      });

      const result = await service.getAllInvoices();
      expect(result).toEqual(invoices);
      expect(model.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return an invoice by ID', async () => {
      const invoice = { id: '1', amount: 100 };
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(invoice),
      });

      const result = await service.findById('1');
      expect(result).toEqual(invoice);
      expect(model.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if invoice is not found', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('2')).rejects.toThrow(NotFoundException);
      expect(model.findById).toHaveBeenCalledWith('2');
    });
  });

  describe('create', () => {
    it('should create and return a new invoice', async () => {
      const currentDate = new Date();
      const invoiceData = {
        customer: 'Ahsan Amin',
        amount: 1000,
        date: currentDate,
        reference: 'REF123',
        items: [{ sku: 'ITEM001', qt: 2 }],
      };

      const createdInvoice = {
        id: '1',
        ...invoiceData,
      };
      model.create.mockReturnValue(createdInvoice);

      const result = await service.create(invoiceData);
      expect(result.customer).toEqual('Ahsan Amin');
      expect(result.reference).toEqual('REF123');
      expect(result.items).toEqual([{ sku: 'ITEM001', qt: 2 }]);
      expect(model.create).toHaveBeenCalledWith(invoiceData);
      expect(model.create).toHaveBeenCalled();
    });
  });

  describe('getTotalAmountForLast24Hours', () => {
    it('should return the total amount of invoices from the last 24 hours', async () => {
      const invoices = [{ amount: 100 }, { amount: 200 }];
      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(invoices),
      });

      const result = await service.getTotalAmountForLast24Hours();
      expect(result).toEqual(300);
      expect(model.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTotalQuantityBySKU', () => {
    it('should return total quantity sold by SKU', async () => {
      const aggregationResult = [{ _id: 'SKU1', totalQuantitySold: 10 }];
      model.aggregate.mockResolvedValue(aggregationResult);

      const result = await service.getTotalQuantityBySKU();
      expect(result).toEqual(aggregationResult);
      expect(model.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleDailyCron', () => {
    it('should call methods to get totals and emit an event', async () => {
      jest
        .spyOn(service, 'getTotalAmountForLast24Hours')
        .mockResolvedValue(300);
      jest
        .spyOn(service, 'getTotalQuantityBySKU')
        .mockResolvedValue([{ _id: 'SKU1', totalQuantitySold: 10 }]);

      await service.handleDailyCron();

      expect(service.getTotalAmountForLast24Hours).toHaveBeenCalled();
      expect(service.getTotalQuantityBySKU).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('summary_created', {
        totalSales: 300,
        quantity_per_item: [{ _id: 'SKU1', totalQuantitySold: 10 }],
      });
    });
  });
});
