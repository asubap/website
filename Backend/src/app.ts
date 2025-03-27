import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import protectedRouter from './routes/protected';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
}));
app.use(express.json());

// Public route
app.get('/', (req, res) => {
  res.send('Hello, Backend!');
});

// Protected route example
app.use('/api/protected', protectedRouter);

export default app;
