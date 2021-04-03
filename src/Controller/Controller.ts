// Imports
import { Request, Response } from "express";
import mongoose from "mongoose";
import TempModel from "../Model/TempModel";
import AbnormalModel from '../Model/Abnormal';

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

    // Check for abnormal body and store it in abnormal table if any.
    checkAbnormality(bodyTemp.toString(), bodyPulse.toString(), io);

    // Emit the data to the client before storing it in the database.
    io.sockets.emit("Temp", {
      bodyPulse, bodyTemp
    });

    // Create a new temp doc from the provided data
    const newTempData = new TempModel({ bodyPulse, bodyTemp });
    newTempData
      .save()
      .then((document) => {
        // Doc saved successfully
        // 200 status OK
        res.status(200).json({
          error: false,
          message: "Success",
          doc: document,
        });
      })
      // Server problem
      // 500 Internal Server Error
      .catch((err) => {
        res.status(500).json({
          error: false,
          message: "Failed ->" + err,
        });
      });
  }
}


function checkAbnormality(bodyTemp: string, bodyPulse: string, io: any) {
  return check(parseFloat(bodyPulse), parseFloat(bodyTemp), io);
}


async function check(bodyTemp: number, bodyPulse: number, io: any): Promise<boolean> {
  let flag1: boolean = bodyTemp >= 36 || bodyTemp <= 38;
  let flag2: boolean = bodyPulse >= 60 || bodyPulse <= 110;
  if (!flag1 || !flag2) {
    // Abnormal bodyTemp  or bodyTemp, store both in the database
    // Store in the abnormal table

    // Emit an abnormal event for the client
    io.sockets.emit("Abnormal", {
      bodyPulse, bodyTemp
    });

    // Save the doc to the database
    let newAbnormal: mongoose.Document = new AbnormalModel({
      bodyTemp,
      bodyPulse
    });

    await newAbnormal.save();
    return true;
  }
  // Store in the normal table
  return false;
}

// Get request to get all abnormal records for the patient 
async function getAbnormalBodyData(req: Request, res: Response) {
  try {
    const abnormalData: mongoose.Document[] = await AbnormalModel.find({});
    abnormalData.length >= 0 ?
      res.json({
        error: false,
        data: abnormalData,
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
export { getBodyData, getAbnormalBodyData };