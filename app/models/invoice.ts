import mongoose from 'mongoose';
import { IUser } from './user.server';
const { Schema, model, models } = mongoose;

export interface InvoiceItem {
  description: string;
  additionalDetails?: string;
  rate: number;
  quantity: number;
  amount: number;
  taxable: boolean;
}

export interface InvoiceData {
  _id?: string;
  user: IUser | string;
  template: string;
  title: string;
  logo?: string;

  fromName: string;
  fromEmail?: string;
  fromAddress?: string;
  fromPhone?: string;
  businessNumber?: string;

  billToName: string;
  billToEmail?: string;
  billToAddress?: string;
  billToPhone?: string;
  billToMobile?: string;
  billToFax?: string;

  invoiceNumber: string;
  date: string;
  terms: string;

  items: InvoiceItem[];

  subtotal: number;
  taxType?: string;
  taxRate?: number;
  taxAmount: number;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  total: number;
  balanceDue: number;

  notes?: string;
  signature?: string;
  color: string;
  currency: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const invoiceItemSchema = new Schema({
  description: { type: String, required: true },
  additionalDetails: { type: String, default: '' },
  rate: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true, min: 0 },
  taxable: { type: Boolean, default: true }
});

const invoiceSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },

  title: { type: String, default: 'Invoice' },
  logo: { type: String, default: '' },
  template: {  type: String, default: 'Classic' },

  fromName: { type: String, required: [true, 'Business name is required'] },
  fromEmail: {
    type: String, default: ''
  },
  fromAddress: { type: String, default: '' },
  fromPhone: { type: String, default: '' },
  businessNumber: { type: String, default: '' },

  billToName: { type: String, required: [true, 'Client name is required'] },
  billToEmail: {
    type: String, default: ''
  },
  billToAddress: { type: String, default: '' },
  billToPhone: { type: String, default: '' },
  billToMobile: { type: String, default: '' },
  billToFax: { type: String, default: '' },

  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    index: true
  },
  date: { type: String, required: [true, 'Invoice date is required'] },
  terms: { type: String, default: 'On Receipt' },

  items: {
    type: [invoiceItemSchema],
    required: [true, 'At least one item is required'],
    validate: [
      {
        validator: function (items: InvoiceItem[]) {
          return items.length > 0;
        },
        message: 'Invoice must have at least one item'
      }
    ]
  },

  subtotal: { type: Number, required: true, min: 0 },
  taxType: { type: String, default: 'None' },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountType: { type: String, default: 'None' },
  discountValue: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  notes: { type: String, default: '' },
  signature: { type: String, default: '' },
  color: { type: String, default: '#ffffffff' },
  currency: { type: String, default: 'USD'},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

invoiceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Invoice = models.Invoice || model('Invoice', invoiceSchema);


export async function createInvoice(
  invoiceData: Omit<InvoiceData, 'createdAt' | 'updatedAt' | '_id'>
): Promise<InvoiceData> {
  try {
    const existingInvoice = await Invoice.findOne({ invoiceNumber: invoiceData.invoiceNumber });
    if (existingInvoice) {
      throw new Error(`Invoice number ${invoiceData.invoiceNumber} already exists`);
    }
    const invoice = await Invoice.create(invoiceData);
    return invoice.toObject();
  } catch (err) {
    const error = err as any;
    if (error?.code === 11000) {
      throw new Error(`Invoice number ${invoiceData.invoiceNumber} already exists`);
    }
    throw new Error(error?.message || 'Internal server error');
  }
}

export async function updateInvoice(id: string, updates: Partial<InvoiceData>): Promise<InvoiceData | null> {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return invoice.toObject();
  } catch (err) {
    const error = err as any;
    throw new Error(error?.message || 'Internal server error');
  }
}


export async function deleteInvoicesByUserId(userId: string): Promise<number> {
  try {
    const result = await Invoice.deleteMany({ user: userId });
    return result.deletedCount || 0;
  } catch (err) {
    const error = err as any;
    throw new Error(error?.message || 'Internal server error');
  }
}
