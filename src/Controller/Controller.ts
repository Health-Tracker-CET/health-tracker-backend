// Imports
import { Request, Response } from "express";
import mongoose from "mongoose";
import AbnormalModel from '../Model/Abnormal';
import UserModel from '../Model/Test';

// Post request
// Accepts bodyTemp and bodyPulse in the request query and puts it in to the collection
function getBodyData(req: Request, res: Response, io: any): void {
  // Get the query parameters
  const { bodyPulse, bodyTemp } = req.query;

  // If one or more parameters are missing
  //  400 Bad Request
  if (!bodyPulse || !bodyTemp) {
    res.status(400).json({
      error: true,
      message: "One or more parameters missing.",
    });
    // All parameters are sent
  } else {

    // Emit the data to the client before storing it in the database.
    io.sockets.emit("Temp", {
      bodyPulse,
      bodyTemp,
      createdAt: new Date().getTime(),
    });

    // Check for abnormal body and store it in abnormal table if any.
    try {
      checkAbnormality(bodyTemp.toString(), bodyPulse.toString(), io);
        res.status(200).json({
          error: false,
          message: "Success",
          
        });

    } catch(err) {
        res.status(200).json({
          error: true,
          message: err,
          
        });
    }

    

    

  }
}

async function saveBodyData(bodyTemp : number, bodyPulse : number, uid : string, io : any, model : any) : Promise<void> {
  const isUser = await model.findOne({uid});

  try {
    if(isUser) {
      // Uid is present, save body data
      isUser.temp = [...isUser.temp, {
        bodyTemp,
        bodyPulse
      }];
      await isUser.save();
      return;    
    }
  
    const newUser = new model({
      uid : uid,
      temp : [{
        bodyTemp,
        bodyPulse
      }]
    });
  
    await newUser.save();
  
    return;  
  } catch (error) {
    console.log(error);
    
  }
  
}

function checkAbnormality(bodyTemp: string, bodyPulse: string, io: any) {
  return check(parseFloat(bodyTemp), parseFloat(bodyPulse), io);
}


async function check(bodyTemp: number, bodyPulse: number, io: any): Promise<boolean> {
  let flag1: boolean = bodyTemp >= 36 && bodyTemp <= 38;
  let flag2: boolean = bodyPulse >= 60 && bodyPulse <= 110;
  if (!flag1 || !flag2) {
    // Abnormal bodyTemp  or bodyTemp, store both in the database
    // Store in the abnormal table

    // Emit an abnormal event for the client
    io.sockets.emit("Abnormal", {
      bodyPulse, bodyTemp
    });

    // Save the doc to the database
    // let newAbnormal: mongoose.Document = new AbnormalModel({
    //   bodyTemp,
    //   bodyPulse
    // });

    // await newAbnormal.save();
    return true;
  }
  // Store in the normal table
  return false;
}

// Get request to get all abnormal records for the patient 
async function getAbnormalBodyData(req: Request, res: Response) {
  try {
    const {uid} = req.body;
    const abnormalData: mongoose.Document[] = await AbnormalModel.find({uid});
    abnormalData.length >= 0 ?
      res.json({
        error: false,
        data: abnormalData[0],
        message: "Success"
      })
      :
      res.json({
        error: true,
        data: [],
        message: "No abnormal records found."
      })

  } catch (err: any) {
    res.json({
      error: true,
      data: [],
      message: err
    })
  }
}

// Exports
export { getBodyData, getAbnormalBodyData, saveBodyData };