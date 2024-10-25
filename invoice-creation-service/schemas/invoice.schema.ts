import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;


@Schema()
class Items {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  qt: number;
}


@Schema()
export class Invoice {
  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: false })
  date: Date;

  @Prop([Items])
  items: Items[];
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
