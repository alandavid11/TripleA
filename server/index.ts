import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/status', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
