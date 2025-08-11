import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.server';

export interface Settings  {
  user: IUser | string;
  title?: string;
  template: string;
  logo?: string;
  fromName?: string;
  fromEmail?: string;
  fromAddress?: string;
  fromPhone?: string;
  businessNumber?: string;
  taxType?: string;
  taxRate?: number;
  color?: string;
  signature?: string;
  currency: string;
}

const settingsSchema = new Schema<Settings>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  title: { type: String },
  logo: { type: String},
  template: {  type: String, default: 'Classic' },
  fromName: { type: String},
  fromEmail: { type: String },
  fromAddress: { type: String },
  fromPhone: { type: String },
  businessNumber: { type: String },
  taxType: { type: String, default: 'None' },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  color: { type: String, default: '#ffffffff' },
  signature: { type: String, default: '' },
  currency: { type: String, default: 'USD'}
});



export const Settings = model<Settings>('Settings', settingsSchema);