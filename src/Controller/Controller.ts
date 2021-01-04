import { Request, Response } from "express";

async function getBodyData(req : Request, res : Response) : Promise<any> {
    const {bodyPulse, bodyTemp} = req.body;

    res.json({
        bodyPulse,
        bodyTemp
    })
}

export {
    getBodyData
}