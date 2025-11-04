import express from 'express';
import cors from 'cors';
import seatsRouter from './routes/seats.js';
import bookingsRouter from './routes/bookings.js';


const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/seats', seatsRouter);
app.use('/api/bookings', bookingsRouter);


app.get('/', (req, res) => res.send('✅ Ticketing backend running'));


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));