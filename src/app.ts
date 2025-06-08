import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './controllers/auth.controller';
import { errorHandler } from './utils/error-handler';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Error handling
app.use(errorHandler);

export { app };
