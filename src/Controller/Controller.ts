import { Request, Response } from "express";
import mongoose from 'mongoose';
import TempModel from '../Model/TempModel';

function getBodyData(req : Request, res : Response) : void {
    const {bodyPulse, bodyTemp} = req.query;
    if(!bodyPulse || !bodyTemp) {
        res.status(400).json({
            error : true,
            message : "One or more parameters missing."
        })
    } else {
        const newTempData = new TempModel({bodyPulse, bodyTemp});
        newTempData.save()
        .then((document) => {
            
            res.status(200).json({
                error : false,
                message : "Success",
                doc : document
            })
        })
        .catch(err => {
            
            res.status(500).json({
                error : false,
                message : "Failed ->" + err
            })
        })


    }
    
}

export {
    getBodyData
}