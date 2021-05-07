import { Request, Response } from "express";
import DoctorModel from '../Model/Doctor';

async function getDoctors(req : Request, res : Response) : Promise<void> {
    try {
        const doctors = await getDoctorList();
        if(!doctors) {
            // No doctors found
            res.status(400).json({
                error : true, 
                message : "No doctors registered yet"
            });
            return;
        }

        res.status(200).json({
            error : false,
            message : "OK",
            data : doctors
        });
        
    } catch(err) {
        res.status(500).json({
            error : true,
            message : err
        })
    }
}

async function getDoctorByUid(req: Request,res: Response):Promise<void> {
    try {
        const {uid} = req.body;
        const doctor = await DoctorModel.find({uid});
        if (doctor.length > 0) {
            // doctor found
            res.json({
                error:false,
                data : doctor[0]
            })
            return;
        }

        if (doctor == undefined || doctor.length == undefined || doctor.length == 0) {
            res.status(404).json({
                error:true,
                message: "Doctor with this id not present"
            });
            return;
        }
    } catch (error) {
        res.status(404).json({
            error:true,
            message: "Doctor not found"
        });
    }
}

async function getDoctorList() {
    const doctors = await DoctorModel.find({});
    
    return doctors;
}


export {
    getDoctors,
    getDoctorList,
    getDoctorByUid
}