import express from 'express';
import mongoose from 'mongoose';
import Router from './Routes/Routes';
const dotenv = require('dotenv').config();
const app = express();
<<<<<<< Updated upstream
const PORT = process.env.PORT || 3000  ;

=======
const PORT = 3000 || process.env.PORT;
const KEY = process.env.THINK_SPEAK_API_KEY;
const DB_URI = process.env.DB_URI;
const db = mongoose.connection;
>>>>>>> Stashed changes
app.use(express.json());
app.use(express.urlencoded({extended : false}));

mongoose.connect(DB_URI!, ({useNewUrlParser : true, useUnifiedTopology : true}));

db.once('open', () => {
    console.log(`Connected to database...`)
})


app.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).send("<h1>Hello World</h1>");
})



app.use('/api', Router)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});