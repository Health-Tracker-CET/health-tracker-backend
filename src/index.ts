// Imports
require('dotenv').config();
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Router from './Routes/Routes';
import http from 'http';
import cors from 'cors';
import {Socket} from 'socket.io'
import { getBodyData, saveBodyData } from './Controller/Controller';
import UserModel from './Model/Test';
import AbnormalModel from './Model/Abnormal';
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
const DB_URI = process.env.DB_URI;

// Init the db variable to listen for events related to mongoDB server
const db = mongoose.connection;


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

})

 // Socket event for client connection to the server
 io.on("connection", async (socket: Socket) => {
    


    app.use("/api/data",(req: Request,res: Response)=>{
        getBodyData(req,res,io);
    });

    socket.on('data-save', (data) => {        
        const {bodyTemp, bodyPulse, uid} = data;
        saveBodyData(parseFloat(bodyTemp), parseFloat(bodyPulse), uid, io, UserModel);
    });

    socket.on('abnormal-data-save', (data) => {
        const {bodyTemp, bodyPulse, uid} = data;
        saveBodyData(parseFloat(bodyTemp), parseFloat(bodyPulse), uid, io, AbnormalModel);
    });


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



// Gives a random number between two numbers
// Refactor this to another folder namely utils folder
function randomNumber(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

