import { Request, Response } from "express";
import AttendantModel from "../Model/Attendant";
import DoctorModel from '../Model/Doctor';
import PrescriptionModel from "../Model/Prescription";
import UserModel from '../Model/UserModel';
import { getAllAttendantUsers } from "./AttendantController";
import { sendSmsInternal } from "./SmsController";

interface IRequestBody {
    patientId : string,
    doctorId : string,
    dateCreated? : Date,
    medicines : [IMedicineObject]
}

interface IMedicineObject {
    name : string,
    quantity : number,
    direction : string
}

interface IResponseObj {
    error : boolean,
    message : string,
    data? : []
}

interface IRequestPrescription {
    doctorId : string,
    patientId : string,
    count : number
}

interface IUser {
    name : string,
    email: string,
    uid:string,
    attendant_uid?:string,
    phone?:string
}

// Add a prescription for a particular patient to be added
// by a given doctor already present in the database
async function addPrescription(req : Request, res : Response) : Promise<void> {
    const body : IRequestBody = req.body;
    // Check if the doctorid and patient id is provided or not
    if(!body.doctorId || !body.patientId) {
        let responseObj : IResponseObj = {
            error : true,
            message : "Doctor id or patient id is not present"
        }
        res.status(400).json(responseObj);
        return;
    }
    // Check whether the doctor and user are present in the database or not
    const isDoctor = await checkForDoctor(body.doctorId);
    const isUser  = await checkForPatient(body.patientId);
    if(isDoctor && isUser) {
        // Both the user and the doctor are present in the database
        // Store the prescription in the database
        const newPrescription = new PrescriptionModel({
            doctorId : body.doctorId,
            patientId : body.patientId,
            medicines : body.medicines
        });
        const saved = await newPrescription.save();
        if(saved) {
            // Prescription saved successfully
            const success : IResponseObj = {
                error : false,
                message : "Prescription added successfully"
            };
            // call messaging api to send text messages to user and attendant
            // 2nd parameter for sending origin address for dashboard login
            sendSmsOnPrescriptionPost(isUser as any,req.get('origin') as string);
            res.status(200).json(success);
            return;
        }
        const error : IResponseObj = {
            error : false,
            message : "Failed to save the prescription"
        };
        res.status(500).json(error);
        return;
    }
    // Doctor and user not present in the database
    const error : IResponseObj = {
        error : true,
        message : "Either doctor or user isn't present in the database"
    };
    res.status(400).json(error);
    return;

}

// Retrieve the prescription for a particular patient
// To be demanded by a saved doctor in the database.
async function retrievePrescription(req : Request, res : Response) : Promise<void> {
    const {doctorId, patientId, count} : IRequestPrescription = req.body;

    // Check if the doctor and the user are present in the respective tables or not
    const isDoctor = checkForDoctor(doctorId);
    const isPatient = checkForPatient(patientId);

    if(isDoctor && isPatient) {
        // Both the doctor and the user are present in the database
        const prescriptions = await PrescriptionModel.find({doctorId, patientId}).sort([['datePrescribed', -1]]).limit(count);
        if(!prescriptions) {
            // No prescription found for that user
            const error : IResponseObj = {
                error : true,
                message : "No prescriptions found for the user"
            };
            res.status(200).json(error);
            return;
        }
        const success : IResponseObj = {
            error : false,
            message : "Retrieved prescriptions",
            data : prescriptions
        };
        res.status(200).json(success);
        return;
        
    }

    // Doctor or the patient aren't present in the database
    const error : IResponseObj = {
        error : true,
        message : "Either the doctor or the patient is not present in the database"
    };
    res.status(400).json(error);
    return;

}

async function checkForDoctor(doctorId : string) : Promise<boolean> {
    try {
        const isDoctor = await DoctorModel.findOne({uid : doctorId});
        return isDoctor ? true : false;
    } catch(err : any) {
        return false;
    }
}

async function checkForPatient(patientId : string) : Promise<boolean> {
    try {
        const isPatient = await UserModel.findOne({uid : patientId});
        return isPatient ? isPatient : false;
    } catch(err : any) {
        return false;
    }
}

const sendSmsOnPrescriptionPost = async (user: IUser,origin:string): Promise<any> =>{
    const {name ,uid, attendant_uid,phone} = user;
    const message = `Prescription has been posted for ${name} . Please check your dashboard at ${origin}`
    const attendant_user = await AttendantModel.find({uid:{$eq:attendant_uid}});
    console.log(attendant_user,phone);
    
    if (attendant_user[0]?.phone !== undefined) {
        
        sendSmsInternal(attendant_user[0]?.phone,message);
    }

    if (phone !== undefined) {
        sendSmsInternal(phone,message);    
    }
    
}

export {
    addPrescription,
    retrievePrescription
}