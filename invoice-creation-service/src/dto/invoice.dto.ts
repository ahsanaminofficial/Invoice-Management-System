// src/dto/invoice.dto.ts
import {
  IsString,
  IsNumber,
  ValidateNested,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

import { Type } from 'class-transformer';

class InvoiceItem {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsNotEmpty()
  qt: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  customer: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  items: InvoiceItem[];
}
