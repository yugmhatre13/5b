import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// Load env vars
dotenv.config();

// Route files
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/users', userRoutes);

// Basic health route
app.get('/', (req, res) => {
  res.send('User Management API is running...');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("WARNING: MONGO_URI is not defined in the environment. Please add it to your .env file.");
    } else {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

    // Only start listening if we aren't heavily hooked in a serverless env (like Vercel)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Export the app for Vercel Serverless
export default app;
