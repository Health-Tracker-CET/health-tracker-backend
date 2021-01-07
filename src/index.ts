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
let interval: NodeJS.Timeout;
let interval2: NodeJS.Timeout;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : false}));

mongoose.connect(DB_URI!, ({useNewUrlParser : true, useUnifiedTopology : true}));

db.once('open', () => {
    console.log(`Connected to database...`);
    

    io.on('connection', async (socket : any) => {       
        console.log('User Connected'); 
        // Return the first 5 recent temp readings to the user
        interval2 = setInterval(async () => {
            const data = await TempModel.find({}).sort({createdAt: -1}).limit(10);
            
            socket.emit('Temp', data);
            
        }, 1000);
            
            
            
        

        socket.on('disconnect', () => {
            console.log('User disconnected');
        })
    });

    interval = setInterval(async () => {
        const newTemp = new TempModel({
            bodyTemp : randomNumber(35, 39),
            bodyPulse : randomNumber(45, 90)
        })

        await newTemp.save();
    }, 1000);
})


app.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).send("<h1>Hello World</h1>");
})

app.use('/api', Router);



server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})


server.on('close', function() {
    clearInterval(interval);
    clearInterval(interval2);
});


process.on('exit', () => {
    clearInterval(interval);
    clearInterval(interval2);
})



function randomNumber(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

