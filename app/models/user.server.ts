import mongoose from 'mongoose';
import { deleteInvoicesByUserId } from './invoice';
const { Schema, model, models } = mongoose;

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    default: 'user'
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [20, 'First name cannot exceed 20 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [20, 'Last name cannot exceed 20 characters']
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = Math.floor(100000 + (Math.random() * 900000)).toString();
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = new Date(Date.now() + 60 * 10 * 1000); 
  return resetToken;
};

UserSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = Math.floor(100000 + (Math.random() * 900000)).toString();
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 24 * 1000);
  return verificationToken;
};


const User = models.User || model<IUser>('User', UserSchema);

export async function deleteUserWithInvoices(userId: string): Promise<{ user: IUser | null; deletedInvoicesCount: number }> {
  try {
    const deletedInvoicesCount = await deleteInvoicesByUserId(userId);
    const deletedUser = await User.findByIdAndDelete(userId);
    return {
      user: deletedUser ? deletedUser.toObject() : null,
      deletedInvoicesCount
    };
  } catch (error) {
    throw new Error('Failed to delete user and associated invoices');
  }
}

export default User;