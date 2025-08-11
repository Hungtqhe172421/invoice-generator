import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
let isConnected = false;

export async function connectToDatabase() {
if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI!;
  await mongoose.connect(mongoUri, { bufferCommands: false });
  isConnected = true;
  console.log('Connected to MongoDB');
}


export { mongoose };