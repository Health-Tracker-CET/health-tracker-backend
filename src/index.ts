const dotenv = require('dotenv').config();
const cors = require('cors');
import express, { NextFunction, Request, Response } from 'express';
import TempModel from './Model/TempModel';
import mongoose from 'mongoose';
import Router from './Routes/Routes';
import http from 'http';
import cron from 'node-cron';


const socket = require('socket.io');
const app = express();
const server = http.createServer(app);

const io = socket(server, {
    cors: {
        origin: '*',
    }
});


const PORT = process.env.PORT || 5000;
const KEY = process.env.THINK_SPEAK_API_KEY;
const DB_URI = process.env.DB_URI;

const db = mongoose.connection;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : false}));

mongoose.connect(DB_URI!, ({useNewUrlParser : true, useUnifiedTopology : true}));

db.once('open', () => {
    console.log(`Connected to database...`);
    

    io.on('connection', (socket : any) => {
        const job = cron.schedule('*/10 * * * * *', async () => {
            //Insert a document every 1 minute about temp and pulse
            const newTemp = new TempModel({
                bodyPulse : randomNumber(60, 90),
                bodyTemp : randomNumber(35, 39)
            });
    
            const doc = await newTemp.save();
            if(doc) {
                console.log(doc + "\n ---------------");
                socket.emit('Temp', doc)
            }
            
            
        });

        socket.on('disconnect', () => {
            job.destroy();
        })
    })
})


app.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).send("<h1>Hello World</h1>");
})

app.use('/api', Router);



server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})





function randomNumber(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

