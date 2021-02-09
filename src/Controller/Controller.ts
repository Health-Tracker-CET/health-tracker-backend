// Imports
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Socket } from "socket.io";
import TempModel from "../Model/TempModel";

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
    // Create a new temp doc from the provided data
    const newTempData = new TempModel({ bodyPulse, bodyTemp });
    newTempData
      .save()
      .then((document) => {
        // Doc saved successfully
        // 200 status OK
        io.sockets.emit("Temp", document);

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

// Exports
export { getBodyData };