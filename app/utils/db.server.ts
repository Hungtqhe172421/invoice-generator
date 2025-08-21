import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;
    const mongoUri = process.env.MONGODB_URI!;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(mongoUri, { bufferCommands: false });
    isConnected = true;
}


export { mongoose };
