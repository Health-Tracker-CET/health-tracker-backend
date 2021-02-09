// Imports
require('dotenv').config();
import express, { Request, Response } from 'express';
import TempModel from './Model/TempModel';
import mongoose from 'mongoose';
import Router from './Routes/Routes';
import http from 'http';
import cors from 'cors';
import {Socket} from 'socket.io'
import { getBodyData } from './Controller/Controller';
const logger = require("morgan");
const socket = require('socket.io');

// Init the app variable for express server
const app = express();

// Create node http server for the socket connection
const server = http.createServer(app);

// Configuring the socket for cors error on client
const io = socket(server, {
    cors: {
        origin: '*',
    }
});

// Environment variables
const PORT = process.env.PORT || 5000;
const KEY = process.env.THINK_SPEAK_API_KEY;
const DB_URI = process.env.DB_URI;

// Init the db variable to listen for events related to mongoDB server
const db = mongoose.connection;

// Set interval that runs as soon as the node server is up and running
// And inserts documents containing body temp and pulse that is randomly generated
// inserting in to the mongo collection every 1 seconds (Change it to a longer duration in production)
let interval: NodeJS.Timeout;

// Set interval that sends 10 most recent temp and pulse readings
// to the client via sockets
let interval2: NodeJS.Timeout;

// Middlewares for the express server
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(logger('dev'));

// Connection to the mongoDb server
mongoose.connect(DB_URI!, ({useNewUrlParser : true, useUnifiedTopology : true}));

// Listen for open event to the DB and see that the connection is made successfully
db.once('open', () => {
    // If this fucntion is run then the db is connected to successfully
    console.log(`Connected to database...`);


    // interval = setInterval(async () => {
    //     // Create a new temp document from random temp and pulse
    //     // Ideally this should be read from the IOT device 
    //     // and not be randomly generated
    //     const newTemp = new TempModel({
    //         bodyTemp : randomNumber(35, 39),
    //         bodyPulse : randomNumber(45, 90)
    //     })

    //     // Save the newly created Doc
    //     await newTemp.save();
    // }, 1000);
})

 // Socket event for client connection to the server
 io.on("connection", async (socket: Socket) => {
    console.log("User Connected");


    app.use("/api/data",(req: Request,res: Response)=>{
        getBodyData(req,res,io);
    })
    // Listen for socket client disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });


// As react is used as the client
// Dummy index route
app.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).send("<h1>Hello World</h1>");
})

// Api route for the business logic of the app
app.use('/api', Router);


// Listen for http requests
server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})

// Clear the intervals on server or process close to avoid
// memory leaks
// Cron job was previously used but it was difficult to shut it down
server.on('close', function() {
    // clearInterval(interval);
    // clearInterval(interval2);
});


process.on('exit', () => {
    // clearInterval(interval);
    // clearInterval(interval2);
})


// Gives a random number between two numbers
// Refactor this to another folder namely utils folder
function randomNumber(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

